using Microsoft.EntityFrameworkCore;
using Microsoft.IdentityModel.Tokens;
using WatchersWorld.Server.Chat.DTOs;
using WatchersWorld.Server.Chat.Models;
using WatchersWorld.Server.Data;

namespace WatchersWorld.Server.Chat.Services
{
    public interface IChatService
    {
        Task<bool> CreateChat(string user1Id, string user2Id);
        Task<bool> DeleteChat(string user1Id, string user2Id);
        Task<List<Models.Chat>> GetChatsByUser(string userId);
        Task<List<string>> GetUsersThatHaveChatWith(string userId);
        Task<MessageDto> SendMessage(string userSenderId, string userReceiverId, string textMessage, DateTime? sentAt);
        Task<MessageDto> MarkMessageAsRead(string messageId);
        Task<List<MessageDto>> GetAllMessagesByChat(string chatId);
        Task<List<MessageDto>> GetAllMessagesByUsers(string user1Id, string user2Id);
        Task<Models.Chat> GetChatByUsers(string user1Id, string user2Id);
    }

    public class ChatService : IChatService
    {
        private readonly WatchersWorldServerContext _context;

        public ChatService(WatchersWorldServerContext context)
        {
            _context = context;
        }

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

        public async Task<List<Models.Chat>> GetChatsByUser(string userId)
        {
            if (userId.IsNullOrEmpty()) return [];

            var chats = await _context.Chats.Where(c => c.User1Id == userId || c.User2Id == userId).ToListAsync();

            return chats;
        }

        public async Task<List<string>> GetUsersThatHaveChatWith(string userId)
        {
            if (userId.IsNullOrEmpty()) return [];

            var chats = await GetChatsByUser(userId);

            var userIds = chats.Select(c => c.User1Id == userId ? c.User2Id : c.User1Id).Distinct().ToList();

            return userIds;
        }

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

        public async Task<MessageDto> MarkMessageAsRead(string messageId)
        {
            if(messageId.IsNullOrEmpty()) return null;
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
            } catch (Exception ex)
            {
                Console.Error.WriteLine(ex.Message);
                return null;
            }
        }

        public async Task<List<MessageDto>> GetAllMessagesByChat(string chatId)
        {
            if(chatId.IsNullOrEmpty()) return [];
            
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

        public async Task<Models.Chat> GetChatByUsers(string user1Id, string user2Id)
        {
            var chat = await _context.Chats.Where(c => (c.User1Id == user1Id && c.User2Id == user2Id) || 
                                                        (c.User2Id == user1Id && c.User1Id == user2Id))
                                            .FirstOrDefaultAsync();

            return chat;
        }
    }
}
