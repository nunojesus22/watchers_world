using Microsoft.AspNetCore.Identity;
using Microsoft.AspNetCore.SignalR;
using Microsoft.EntityFrameworkCore;
using WatchersWorld.Server.Chat.DTOs;
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

        private static readonly Dictionary<string, string> _userConnections = new Dictionary<string, string>();

        public ChatHub(IChatService chatService, INotificationService notificationsService, UserManager<User> userManager, WatchersWorldServerContext context)
        {
            _chatService = chatService;
            _notificationService = notificationsService;
            _userManager = userManager;
            _context = context;
        }

        public override async Task OnConnectedAsync()
        {
            var username = Context.GetHttpContext().Request.Query["username"].ToString();
            var user = await _userManager.FindByNameAsync(username);
            Console.WriteLine($"Utilizador logado: {user.Id}, {user.UserName}");

            lock (_userConnections)
            {
                _userConnections[user.Id] = Context.ConnectionId;
            }

            var chats = await GetUserChatsWithMessages(user.Id);

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

        public async Task<DateTime?> SendMessage(string usernameReceiver, MessageDto message)
        {
            var username = Context.GetHttpContext().Request.Query["username"].ToString();
            var userSender = await _userManager.FindByNameAsync(username);
            var userSenderId = userSender.Id;

            var userReceiver = await _userManager.FindByNameAsync(usernameReceiver);
            var userReceiverId = userReceiver.Id;

            var time = DateTime.UtcNow;
            message.SentAt = time;

            var result = await _chatService.SendMessage(userSenderId, userReceiverId, message.Text, message.SentAt);
            await _notificationService.CreateMessageNotificationAsync(userSenderId, userReceiverId);
            if (result)
            {
                if (_userConnections.ContainsKey(userReceiverId))
                {
                    await Clients.Client(_userConnections[userReceiverId]).SendAsync("ReceiveMessage", new MessageDto
                    {
                        SendUsername = username,
                        Text = message.Text,
                        SentAt = message.SentAt,
                    });
                }
            }

            return message.SentAt;
        }

        public async Task<IEnumerable<ChatWithMessagesDto>> GetMissingChats(IEnumerable<ChatWithMessagesDto> chatsThatAlreadyHad)
        {
            var username = Context.GetHttpContext().Request.Query["username"].ToString();
            var userSender = await _userManager.FindByNameAsync(username);
            var userSenderId = userSender.Id;
            var allChats = await GetUserChatsWithMessages(userSenderId);

            var missingChats = allChats.Where(ac => !chatsThatAlreadyHad.Any(c => c.Username == ac.Username)).ToList();

            return missingChats;
        }

        public async Task<IEnumerable<ChatWithMessagesDto>> GetUserChatsWithMessages(string userSenderId) 
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

                chatsWithMessages.Add(new ChatWithMessagesDto
                {
                    Username = otherUserUsername,
                    ProfilePhoto = profilePhoto,
                    Messages = messages.Select(m => new MessageDto
                    {
                        SendUsername = _context.Users.Where(u => u.Id == m.SendUserId).Select(u => u.UserName).FirstOrDefault(),
                        SentAt = m.SentAt,
                        Text = m.Text
                    }).ToList()
                });
            }

            return chatsWithMessages;
        }
    }
}
