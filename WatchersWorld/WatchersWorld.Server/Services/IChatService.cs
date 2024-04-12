using Microsoft.EntityFrameworkCore;
using Microsoft.IdentityModel.Tokens;
using WatchersWorld.Server.Chat.Models;
using WatchersWorld.Server.Data;
using WatchersWorld.Server.DTOs.Chat;

namespace WatchersWorld.Server.Services
{
    /// <summary>
    /// Define os serviços disponíveis para manipulação de chats e mensagens entre usuários.
    /// </summary>
    public interface IChatService
    {
        /// <summary>
        /// Cria um chat entre dois usuários.
        /// </summary>
        /// <param name="user1Id">Identificador do primeiro usuário.</param>
        /// <param name="user2Id">Identificador do segundo usuário.</param>
        /// <returns>True se o chat foi criado com sucesso, false caso contrário.</returns>
        Task<bool> CreateChat(string user1Id, string user2Id);

        /// <summary>
        /// Deleta um chat existente entre dois usuários.
        /// </summary>
        /// <param name="user1Id">Identificador do primeiro usuário.</param>
        /// <param name="user2Id">Identificador do segundo usuário.</param>
        /// <returns>True se o chat foi deletado com sucesso, false caso contrário.</returns>
        Task<bool> DeleteChat(string user1Id, string user2Id);

        /// <summary>
        /// Deleta uma mensagem específica enviada por um usuário.
        /// </summary>
        /// <param name="user1Id">Identificador do usuário que enviou a mensagem.</param>
        /// <param name="messageId">Identificador da mensagem a ser deletada.</param>
        /// <returns>True se a mensagem foi deletada com sucesso, false caso contrário.</returns>
        Task<bool> DeleteMessage(string user1Id, string messageId);

        /// <summary>
        /// Recupera todos os chats em que um usuário específico está envolvido.
        /// </summary>
        /// <param name="userId">Identificador do usuário.</param>
        /// <returns>Lista de chats do usuário.</returns>
        Task<List<Models.Chat.Chat>> GetChatsByUser(string userId);

        /// <summary>
        /// Recupera os identificadores dos usuários que têm chats com um usuário específico.
        /// </summary>
        /// <param name="userId">Identificador do usuário.</param>
        /// <returns>Lista de identificadores de usuários.</returns>
        Task<List<string>> GetUsersThatHaveChatWith(string userId);

        /// <summary>
        /// Envia uma mensagem de um usuário para outro.
        /// </summary>
        /// <param name="userSenderId">Identificador do usuário que envia a mensagem.</param>
        /// <param name="userReceiverId">Identificador do usuário que recebe a mensagem.</param>
        /// <param name="textMessage">Conteúdo da mensagem.</param>
        /// <param name="sentAt">Data e hora opcional de envio da mensagem.</param>
        /// <returns>A mensagem enviada como DTO.</returns>
        Task<MessageDto> SendMessage(string userSenderId, string userReceiverId, string textMessage, DateTime? sentAt);

        /// <summary>
        /// Marca uma mensagem como lida pelo destinatário.
        /// </summary>
        /// <param name="messageId">Identificador da mensagem.</param>
        /// <returns>A mensagem atualizada como DTO.</returns>
        Task<MessageDto> MarkMessageAsRead(string messageId);

        /// <summary>
        /// Recupera todas as mensagens de um chat específico.
        /// </summary>
        /// <param name="chatId">Identificador do chat.</param>
        /// <returns>Lista de mensagens do chat como DTOs.</returns>
        Task<List<MessageDto>> GetAllMessagesByChat(string chatId);

        /// <summary>
        /// Recupera todas as mensagens trocadas entre dois usuários.
        /// </summary>
        /// <param name="user1Id">Identificador do primeiro usuário.</param>
        /// <param name="user2Id">Identificador do segundo usuário.</param>
        /// <returns>Lista de mensagens trocadas como DTOs.</returns>
        Task<List<MessageDto>> GetAllMessagesByUsers(string user1Id, string user2Id);

        /// <summary>
        /// Recupera o chat entre dois usuários específicos.
        /// </summary>
        /// <param name="user1Id">Identificador do primeiro usuário.</param>
        /// <param name="user2Id">Identificador do segundo usuário.</param>
        /// <returns>O chat encontrado, ou null se não existir.</returns>
        Task<Models.Chat.Chat> GetChatByUsers(string user1Id, string user2Id);
    }


    /// <summary>
    /// Serviço que implementa a interface IChatService para gerenciar operações de chat.
    /// </summary>
    /// <remarks>
    /// Construtor para o serviço de chat, requerendo o contexto do servidor para operações de banco de dados.
    /// </remarks>
    /// <param name="context">Contexto do banco de dados.</param>
    public class ChatService(WatchersWorldServerContext context) : IChatService
    {
        private readonly WatchersWorldServerContext _context = context;

        /// <inheritdoc />
        public async Task<bool> CreateChat(string user1Id, string user2Id)
        {
            if (user1Id.IsNullOrEmpty() || user2Id.IsNullOrEmpty() || user1Id == user2Id) return false;

            var chat = await GetChatByUsers(user1Id, user2Id);
            if (chat != null) return false;

            try
            {
                var newChat = new Models.Chat
                {
                    User1Id = user1Id,
                    User2Id = user2Id,
                    CreatedAt = DateTime.UtcNow,
                };

                _context.Chats.Add(newChat);

                await _context.SaveChangesAsync();
                return true;
            }
            catch (Exception ex)
            {
                Console.Error.WriteLine(ex.Message);
                return false;
            }
        }
        /// <inheritdoc />
        public async Task<bool> DeleteChat(string user1Id, string user2Id)
        {
            if (user1Id.IsNullOrEmpty() || user2Id.IsNullOrEmpty() || user1Id == user2Id) return false;

            var chat = await GetChatByUsers(user1Id, user2Id);
            if (chat == null) return false;

            try
            {
                var messages = await GetAllMessagesByChat(chat.Id.ToString());

                var messagesIds = messages.Select(m => m.MessageId).ToList();

                var userMessageVisibilities = _context.MessagesVisibility
                     .Where(v => messagesIds.Contains(v.MessageId) && v.UserId == user1Id);

                foreach (var vis in userMessageVisibilities)
                {
                    vis.Visibility = false;
                }

                await _context.SaveChangesAsync();
                return true;
            }
            catch (Exception ex)
            {
                Console.Error.WriteLine(ex.Message);
                return false;
            }
        }
        /// <inheritdoc />
        public async Task<bool> DeleteMessage(string user1Id, string messageId)
        {
            if (user1Id.IsNullOrEmpty() || messageId.IsNullOrEmpty()) return false;

            var message = await _context.Messages.Where(m => m.Id == messageId).FirstAsync();
            if (message == null) return false;

            try
            {
                var userMessageVisibility = await _context.MessagesVisibility.Where(v => v.MessageId == messageId && v.UserId == user1Id).FirstAsync();

                userMessageVisibility.Visibility = false;

                await _context.SaveChangesAsync();
                return true;
            }
            catch (Exception ex)
            {
                Console.Error.WriteLine(ex.Message);
                return false;
            }
        }
        /// <inheritdoc />
        public async Task<List<Models.Chat.Chat>> GetChatsByUser(string userId)
        {
            if (userId.IsNullOrEmpty()) return [];

            var chats = await _context.Chats.Where(c => c.User1Id == userId || c.User2Id == userId).ToListAsync();

            return chats;
        }
        /// <inheritdoc />
        public async Task<List<string>> GetUsersThatHaveChatWith(string userId)
        {
            if (userId.IsNullOrEmpty()) return [];

            var chats = await GetChatsByUser(userId);

            var userIds = chats.Select(c => c.User1Id == userId ? c.User2Id : c.User1Id).Distinct().ToList();

            return userIds;
        }
        /// <inheritdoc />
        public async Task<MessageDto> SendMessage(string userSenderId, string userReceiverId, string textMessage, DateTime? sentAt = null)
        {
            if (userSenderId.IsNullOrEmpty() || userReceiverId.IsNullOrEmpty() || userSenderId == userReceiverId || textMessage.IsNullOrEmpty()) return null;

            var chat = await GetChatByUsers(userSenderId, userReceiverId);
            if (chat == null)
            {
                var result = await CreateChat(userSenderId, userReceiverId);
                if (!result) return null;
                chat = await GetChatByUsers(userSenderId, userReceiverId);
            }

            try
            {

                var message = new Messages
                {
                    Id = Guid.NewGuid().ToString(),
                    ChatId = chat!.Id,
                    SendUserId = userSenderId,
                    SentAt = sentAt ?? DateTime.UtcNow,
                    Text = textMessage
                };

                var messageStatus = new MessageStatus
                {
                    MessageId = message.Id.ToString(),
                    RecipientUserId = userReceiverId,
                    ReadAt = null
                };

                var messageSenderVisibility = new MessagesVisibility
                {
                    Id = Guid.NewGuid(),
                    MessageId = message.Id,
                    UserId = userSenderId,
                    Visibility = true
                };

                var messageReceiverVisibility = new MessagesVisibility
                {
                    Id = Guid.NewGuid(),
                    MessageId = message.Id,
                    UserId = userReceiverId,
                    Visibility = true
                };

                _context.Messages.Add(message);
                _context.MessagesStatus.Add(messageStatus);
                _context.MessagesVisibility.AddRange(messageSenderVisibility, messageReceiverVisibility);

                await _context.SaveChangesAsync();
                var messageToReturn = new MessageDto
                {
                    MessageId = message.Id,
                    SendUsername = message.SendUserId,
                    Text = message.Text,
                    SentAt = message.SentAt,
                    ReadAt = messageStatus.ReadAt
                };

                return messageToReturn;
            }
            catch (Exception ex)
            {
                Console.Error.WriteLine(ex.Message);
                return null;
            }

        }
        /// <inheritdoc />
        public async Task<MessageDto> MarkMessageAsRead(string messageId)
        {
            if (messageId.IsNullOrEmpty()) return null;
            var messageStatus = await _context.MessagesStatus.Where(ms => ms.MessageId == messageId).FirstOrDefaultAsync();
            if (messageStatus == null) return null;
            try
            {
                messageStatus.ReadAt = DateTime.UtcNow;
                _context.MessagesStatus.Update(messageStatus);
                await _context.SaveChangesAsync();

                var message = _context.Messages.Where(m => m.Id == messageId).FirstOrDefault();

                var messageToReturn = new MessageDto
                {
                    MessageId = messageId,
                    SendUsername = message.SendUserId,
                    Text = message.Text,
                    SentAt = message.SentAt,
                    ReadAt = messageStatus.ReadAt
                };

                return messageToReturn; ;
            }
            catch (Exception ex)
            {
                Console.Error.WriteLine(ex.Message);
                return null;
            }
        }
        /// <inheritdoc />
        public async Task<List<MessageDto>> GetAllMessagesByChat(string chatId)
        {
            if (chatId.IsNullOrEmpty()) return [];

            var messages = await _context.Messages.Where(m => m.ChatId.ToString() == chatId).OrderBy(m => m.SentAt).ToListAsync();

            var messageIds = messages.Select(m => m.Id).ToList();
            var messageStatuses = await _context.MessagesStatus
                .Where(ms => messageIds.Contains(ms.MessageId))
                .ToListAsync();

            var messageDtos = messages.Select(m => new MessageDto
            {
                MessageId = m.Id,
                SendUsername = _context.Users.Where(u => m.SendUserId == u.Id).Select(u => u.UserName).Single(),
                Text = m.Text,
                SentAt = m.SentAt,
                ReadAt = messageStatuses.FirstOrDefault(ms => ms.MessageId == m.Id)?.ReadAt
            }).ToList();

            return messageDtos;
        }
        /// <inheritdoc />
        public async Task<List<MessageDto>> GetAllMessagesByUsers(string user1Id, string user2Id)
        {
            if (user1Id.IsNullOrEmpty() || user2Id.IsNullOrEmpty() || user1Id == user2Id) return [];

            var chat = await GetChatByUsers(user1Id, user2Id);
            if (chat == null) return [];
            else
            {
                return await GetAllMessagesByChat(chat!.Id.ToString());
            }
        }
        /// <inheritdoc />
        public async Task<Models.Chat.Chat> GetChatByUsers(string user1Id, string user2Id)
        {
            var chat = await _context.Chats.Where(c => c.User1Id == user1Id && c.User2Id == user2Id ||
                                                        c.User2Id == user1Id && c.User1Id == user2Id)
                                            .FirstOrDefaultAsync();

            return chat;
        }
    }
}
