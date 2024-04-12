using Microsoft.AspNetCore.Identity;
using Microsoft.AspNetCore.SignalR;
using Microsoft.EntityFrameworkCore;
using WatchersWorld.Server.Data;
using WatchersWorld.Server.DTOs.Chat;
using WatchersWorld.Server.Models.Authentication;
using WatchersWorld.Server.Services;

namespace WatchersWorld.Server.Hubs
{
    /// <summary>
    /// Hub SignalR que gerencia as interações de chat em tempo real entre usuários, manipulando mensagens, estados de chat e notificações.
    /// </summary>
    public class ChatHub : Hub
    {
        private readonly IChatService _chatService;
        private readonly INotificationService _notificationService;

        private readonly UserManager<User> _userManager;
        private readonly WatchersWorldServerContext _context;

        private readonly ITimeZoneConverterService _timeZoneConverterService;

        /// <summary>
        /// Dicionário estático para armazenar as conexões dos usuários.
        /// </summary>
        private static readonly Dictionary<string, string> _userConnections = new Dictionary<string, string>();

        /// <summary>
        /// Constrói uma instância do ChatHub com os serviços necessários.
        /// </summary>
        /// <param name="chatService">Serviço de gerenciamento de chats.</param>
        /// <param name="notificationsService">Serviço de notificações.</param>
        /// <param name="userManager">Gerenciador de usuários para operações relacionadas a usuários.</param>
        /// <param name="context">Contexto do banco de dados para operações relacionadas a dados.</param>
        /// <param name="timeZoneConverterService">Serviço para conversão de fusos horários.</param>
        public ChatHub(IChatService chatService, INotificationService notificationsService, UserManager<User> userManager, WatchersWorldServerContext context, ITimeZoneConverterService timeZoneConverterService)
        {
            _chatService = chatService;
            _notificationService = notificationsService;
            _userManager = userManager;
            _context = context;
            _timeZoneConverterService = timeZoneConverterService;
        }

        /// <summary>
        /// Acionado quando um cliente se conecta ao hub, registra a conexão e carrega os chats do usuário.
        /// </summary>
        public override async Task OnConnectedAsync()
        {
            var username = Context.GetHttpContext().Request.Query["username"].ToString();
            var user = await _userManager.FindByNameAsync(username);
            var timeZone = Context.GetHttpContext().Request.Query["timeZone"].ToString();

            Console.WriteLine($"Utilizador logado: {user.Id}, {user.UserName}");

            lock (_userConnections)
            {
                _userConnections[user.Id] = Context.ConnectionId;
            }

            var chats = await GetUserChatsWithMessages(user.Id, timeZone);

            await Clients.Caller.SendAsync("ReceiveChatList", chats);

            await base.OnConnectedAsync();
        }

        /// <summary>
        /// Acionado quando um cliente se desconecta do hub, remove o registro da conexão.
        /// </summary>
        public override async Task OnDisconnectedAsync(Exception exception)
        {
            var username = Context.GetHttpContext().Request.Query["username"].ToString();
            var user = await _userManager.FindByNameAsync(username);

            lock (_userConnections)
            {
                _userConnections.Remove(user.Id);
            }

            await base.OnDisconnectedAsync(exception);
        }

        /// <summary>
        /// Envia uma mensagem de um usuário para outro e notifica o receptor se estiver conectado.
        /// </summary>
        /// <param name="usernameReceiver">Nome de usuário do receptor da mensagem.</param>
        /// <param name="message">Objeto DTO contendo detalhes da mensagem.</param>
        /// <param name="timeZone">Fuso horário do cliente para conversão de data/hora.</param>
        /// <returns>Objeto MessageDto representando a mensagem enviada, incluindo o horário convertido para o fuso horário do cliente.</returns>
        public async Task<MessageDto> SendMessage(string usernameReceiver, MessageDto message, string timeZone)
        {
            var username = Context.GetHttpContext().Request.Query["username"].ToString();
            var userSender = await _userManager.FindByNameAsync(username);
            var userSenderId = userSender.Id;

            var userReceiver = await _userManager.FindByNameAsync(usernameReceiver);
            var userReceiverId = userReceiver?.Id;

            if (userReceiverId == null)
            {
                throw new HubException("ID do utilizador receptor não pode ser null.");
            }

            var time = DateTime.UtcNow;
            message.SentAt = time;
            DateTime messageSentAt = time!;

            var result = await _chatService.SendMessage(userSenderId, userReceiverId, message.Text, message.SentAt);
            await _notificationService.CreateMessageNotificationAsync(userSenderId, userReceiverId);

            var readAt = result?.ReadAt != null ? _timeZoneConverterService.ConvertUtcToTimeZone(result.ReadAt.Value, timeZone) : null;
            var messageToReturn = new MessageDto
            {
                MessageId = "",
                SendUsername = username,
                Text = message.Text,
                SentAt = _timeZoneConverterService.ConvertUtcToTimeZone(messageSentAt, timeZone),
                ReadAt = readAt
            };


            if (result != null)
            {
                messageToReturn.MessageId = result.MessageId;
                if (_userConnections.ContainsKey(userReceiverId))
                {
                    await Clients.Client(_userConnections[userReceiverId]).SendAsync("ReceiveMessage", messageToReturn);
                }
                return messageToReturn;
            }
            return null;

        }

        /// <summary>
        /// Recupera chats que não estão na lista de chats já fornecida pelo cliente.
        /// </summary>
        /// <param name="chatsThatAlreadyHad">Lista de chats que o cliente já possui.</param>
        /// <param name="timeZone">Fuso horário do cliente para conversão de data/hora.</param>
        /// <returns>Uma coleção de ChatWithMessagesDto representando os chats ausentes.</returns>
        public async Task<IEnumerable<ChatWithMessagesDto>> GetMissingChats(IEnumerable<ChatWithMessagesDto> chatsThatAlreadyHad, string timeZone)
        {
            var username = Context.GetHttpContext().Request.Query["username"].ToString();
            var userSender = await _userManager.FindByNameAsync(username);
            var userSenderId = userSender.Id;
            var allChats = await GetUserChatsWithMessages(userSenderId, timeZone);

            var missingChats = allChats.Where(ac => !chatsThatAlreadyHad.Any(c => c.Username == ac.Username)).ToList();

            return missingChats;
        }

        /// <summary>
        /// Obtém todos os chats de um usuário, incluindo mensagens visíveis, convertendo as datas para o fuso horário especificado.
        /// </summary>
        /// <param name="userSenderId">Identificador do usuário cujos chats são recuperados.</param>
        /// <param name="timeZone">Fuso horário do cliente para a conversão das datas das mensagens.</param>
        /// <returns>Uma coleção de ChatWithMessagesDto com todos os chats e mensagens visíveis do usuário.</returns>
        public async Task<IEnumerable<ChatWithMessagesDto>> GetUserChatsWithMessages(string userSenderId, string timeZone)
        {
            var chats = await _chatService.GetChatsByUser(userSenderId);
            var chatsWithMessages = new List<ChatWithMessagesDto>();

            foreach (var chat in chats)
            {
                var messages = await _chatService.GetAllMessagesByChat(chat.Id.ToString());
                var otherUserId = chat.User1Id == userSenderId ? chat.User2Id : chat.User1Id;
                var otherUserUsername = await _context.Users.Where(u => u.Id == otherUserId)
                                                        .Select(u => u.UserName)
                                                        .FirstOrDefaultAsync();

                var profilePhoto = await _context.ProfileInfo.Where(u => u.UserId == otherUserId).Select(u => u.ProfilePhoto).FirstOrDefaultAsync();

                var visibleMessages = messages.Where(m => _context.MessagesVisibility.Any(v => v.MessageId == m.MessageId && v.UserId == userSenderId && v.Visibility)).ToList();

                chatsWithMessages.Add(new ChatWithMessagesDto
                {
                    Username = otherUserUsername,
                    ProfilePhoto = profilePhoto,
                    Messages = visibleMessages.Select(m => new MessageDto
                    {
                        MessageId = m.MessageId,
                        SendUsername = m.SendUsername,
                        SentAt = _timeZoneConverterService.ConvertUtcToTimeZone(m.SentAt.Value, timeZone),
                        Text = m.Text,
                        ReadAt = m.ReadAt != null ? _timeZoneConverterService.ConvertUtcToTimeZone(m.ReadAt.Value, timeZone) : null
                    }).ToList()
                });
            }

            return chatsWithMessages;
        }

        /// <summary>
        /// Deleta um chat entre dois usuários e retorna a lista atualizada de chats para o usuário solicitante.
        /// </summary>
        /// <param name="usernameReceiver">Nome de usuário do segundo participante do chat.</param>
        /// <param name="timeZone">Fuso horário do cliente para a conversão das datas das mensagens.</param>
        /// <returns>Uma coleção de ChatWithMessagesDto após a exclusão do chat especificado.</returns>
        public async Task<IEnumerable<ChatWithMessagesDto>> DeleteChat(string usernameReceiver, string timeZone)
        {
            var username = Context.GetHttpContext().Request.Query["username"].ToString();
            var userSender = await _userManager.FindByNameAsync(username);
            var userSenderId = userSender.Id;

            var userReceiver = await _userManager.FindByNameAsync(usernameReceiver);
            var userReceiverId = userReceiver?.Id;

            var result = await _chatService.DeleteChat(userSenderId, userReceiverId);

            if (result)
            {
                return await GetUserChatsWithMessages(userSenderId, timeZone);
            }
            else
            {
                throw new HubException("ID do utilizador receptor não pode ser null.");
            }
        }

        /// <summary>
        /// Deleta uma mensagem específica e retorna a lista atualizada de chats para o usuário solicitante.
        /// </summary>
        /// <param name="timeZone">Fuso horário do cliente para a conversão das datas das mensagens.</param>
        /// <param name="message">MessageDto contendo a identificação da mensagem a ser deletada.</param>
        /// <returns>Uma coleção de ChatWithMessagesDto após a exclusão da mensagem especificada.</returns>
        public async Task<IEnumerable<ChatWithMessagesDto>> DeleteMessage(string timeZone, MessageDto message)
        {
            var username = Context.GetHttpContext().Request.Query["username"].ToString();
            var userSender = await _userManager.FindByNameAsync(username);
            var userSenderId = userSender.Id;

            var result = await _chatService.DeleteMessage(userSenderId, message.MessageId);

            if (result)
            {
                return await GetUserChatsWithMessages(userSenderId, timeZone);
            }
            else
            {
                throw new HubException("ID do utilizador receptor não pode ser null.");
            }
        }

        /// <summary>
        /// Marca várias mensagens como lidas pelo usuário e retorna a lista atualizada de chats.
        /// </summary>
        /// <param name="messages">Coleção de MessageDto das mensagens que devem ser marcadas como lidas.</param>
        /// <param name="timeZone">Fuso horário do cliente para a conversão das datas das mensagens.</param>
        /// <returns>Uma coleção de ChatWithMessagesDto após as mensagens serem marcadas como lidas.</returns>
        public async Task<IEnumerable<ChatWithMessagesDto>> MarkMessagesAsRead(IEnumerable<MessageDto> messages, string timeZone)
        {
            var username = Context.GetHttpContext().Request.Query["username"].ToString();
            var userSender = await _userManager.FindByNameAsync(username);
            var userSenderId = userSender.Id;

            foreach (var message in messages)
            {
                _ = await _chatService.MarkMessageAsRead(message.MessageId) ?? throw new HubException("ID do utilizador receptor não pode ser null.");
            }

            return await GetUserChatsWithMessages(userSenderId, timeZone);
        }
    }
}
