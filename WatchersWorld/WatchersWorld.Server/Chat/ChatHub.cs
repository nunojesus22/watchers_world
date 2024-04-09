using Microsoft.AspNetCore.Identity;
using Microsoft.AspNetCore.SignalR;
using Microsoft.EntityFrameworkCore;
using WatchersWorld.Server.Chat.DTOs;
using WatchersWorld.Server.Chat.Models;
using WatchersWorld.Server.Chat.Services;
using WatchersWorld.Server.Data;
using WatchersWorld.Server.Models.Authentication;
using WatchersWorld.Server.Services;

namespace WatchersWorld.Server.Chat
{
    public class ChatHub : Hub
    {
        private readonly IChatService _chatService;
        private readonly INotificationService _notificationService;

        private readonly UserManager<User> _userManager;
        private readonly WatchersWorldServerContext _context;

        private readonly ITimeZoneConverterService _timeZoneConverterService;

        private static readonly Dictionary<string, string> _userConnections = new Dictionary<string, string>();

        public ChatHub(IChatService chatService, INotificationService notificationsService, UserManager<User> userManager, WatchersWorldServerContext context, ITimeZoneConverterService timeZoneConverterService)
        {
            _chatService = chatService;
            _notificationService = notificationsService;
            _userManager = userManager;
            _context = context;
            _timeZoneConverterService = timeZoneConverterService;
        }

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

            var readAt = (result?.ReadAt != null) ? _timeZoneConverterService.ConvertUtcToTimeZone(result.ReadAt.Value, timeZone) : null;
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

        public async Task<IEnumerable<ChatWithMessagesDto>> GetMissingChats(IEnumerable<ChatWithMessagesDto> chatsThatAlreadyHad, string timeZone)
        {
            var username = Context.GetHttpContext().Request.Query["username"].ToString();
            var userSender = await _userManager.FindByNameAsync(username);
            var userSenderId = userSender.Id;
            var allChats = await GetUserChatsWithMessages(userSenderId, timeZone);

            var missingChats = allChats.Where(ac => !chatsThatAlreadyHad.Any(c => c.Username == ac.Username)).ToList();

            return missingChats;
        }

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
            } else
            {
                throw new HubException("ID do usuário receptor não pode ser null.");
            }
        }

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
                throw new HubException("ID do usuário receptor não pode ser null.");
            }
        }

        public async Task<IEnumerable<ChatWithMessagesDto>> MarkMessagesAsRead(IEnumerable<MessageDto> messages, string timeZone)
        {
            var username = Context.GetHttpContext().Request.Query["username"].ToString();
            var userSender = await _userManager.FindByNameAsync(username);
            var userSenderId = userSender.Id;

            foreach (var message in messages)
            {
                var result = await _chatService.MarkMessageAsRead(message.MessageId);
                if (result == null)
                {
                    throw new HubException("ID do usuário receptor não pode ser null.");
                }
            }

            return await GetUserChatsWithMessages(userSenderId, timeZone);
        }
    }
}
