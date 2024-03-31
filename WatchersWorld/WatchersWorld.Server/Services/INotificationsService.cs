using Microsoft.EntityFrameworkCore;
using System;
using System.Collections.Generic;
using System.Threading.Tasks;
using WatchersWorld.Server.Data;
using WatchersWorld.Server.DTOs.Notifications;
using WatchersWorld.Server.Models.Notifications;

namespace WatchersWorld.Server.Services
{
    /// <summary>
    /// Define as operações relacionadas à gestão de notificações no sistema.
    /// </summary>
    public interface INotificationService
    {
        /// <summary>
        /// Cria uma nova notificação de seguimento.
        /// </summary>
        /// <param name="triggeredByUserId">O identificador do usuário que desencadeou o evento (por exemplo, quem começou a seguir).</param>
        /// <param name="targetUserId">O identificador do usuário que deve receber a notificação.</param>
        Task<FollowNotificationDto> CreateFollowNotificationAsync(string triggeredByUserId, string targetUserId);

        Task<List<FollowNotificationDto>> GetFollowNotificationsForUserAsync(string targetUserId);

        Task<ReplyNotificationDto> CreateReplyNotificationAsync(string triggeredByUserId, string targetUserId, int mediaId, int commentId, string commentText);

        Task<List<ReplyNotificationDto>> GetReplyNotificationsForUserAsync(string targetUserId);

        Task MarkAllFollowNotificationsAsReadAsync(string username);

        Task MarkAllReplyNotificationsAsReadAsync(string username);

        Task ClearNotificationsForUserAsync(string username);

        Task<bool> HasUnreadNotificationsAsync(string username);

        Task<AchievementNotificationDto> CreateAchievementNotificationAsync(string triggeredByUserId, int userMedalId);

        Task<List<AchievementNotificationDto>> GetAchievementNotificationsForUserAsync(string userId);

        Task MarkAllAchievementNotificationsAsReadAsync(string username);

        Task<MessageNotificationDto> CreateMessageNotificationAsync(string triggeredByUserId, string targetUserId);

        Task<List<MessageNotificationDto>> GetMessageNotificationsForUserAsync(string targetUserId);

        Task MarkAllMessageNotificationsAsReadAsync(string username);
    }

    /// <summary>
    /// Implementa as operações definidas pela interface INotificationService, manipulando a lógica de negócios para notificações no sistema.
    /// </summary>
    public class NotificationService : INotificationService
    {
        private readonly WatchersWorldServerContext _context;

        public NotificationService(WatchersWorldServerContext context)
        {
            _context = context;
        }


        public async Task<FollowNotificationDto> CreateFollowNotificationAsync(string triggeredByUserId, string targetUserId)
        {
            // Buscar os perfis dos usuários com base nos IDs de usuário
            var triggeredByUser = await _context.ProfileInfo
                .AsNoTracking()
                .FirstOrDefaultAsync(p => p.UserId == triggeredByUserId);
            var targetUser = await _context.ProfileInfo
                .AsNoTracking()
                .FirstOrDefaultAsync(u => u.UserId == targetUserId);

            if (triggeredByUser == null || targetUser == null)
            {
                throw new Exception("Perfil de usuário não encontrado.");
            }

            var followNotification = new FollowNotification
            {
                NotificationId = Guid.NewGuid(),
                TriggeredByUserId = triggeredByUserId,
                Message = $"{triggeredByUser.UserName} começou-te a seguir!",
                CreatedAt = DateTime.UtcNow,
                IsRead = false,
                EventType = "NewFollower",
                TargetUserId = targetUserId,
            };


            var followNotificationDto = new FollowNotificationDto
            {
                TriggeredByUserId = triggeredByUserId,
                Message = followNotification.Message,
                CreatedAt = followNotification.CreatedAt,
                IsRead = followNotification.IsRead,
                EventType = followNotification.EventType,
                TargetUserId = targetUserId,
                TriggeredByUserPhoto = triggeredByUser.ProfilePhoto
            };

            await _context.FollowNotifications.AddAsync(followNotification);
            await _context.SaveChangesAsync();

            return followNotificationDto;
        }

        public async Task<List<FollowNotificationDto>> GetFollowNotificationsForUserAsync(string targetUserId)
        {
            var notifications = await _context.FollowNotifications
                .Where(n => n.TargetUserId == targetUserId)
                .ToListAsync();

            var notificationDtos = new List<FollowNotificationDto>();

            foreach (var notification in notifications)
            {
                var triggeredByUser = await _context.ProfileInfo
                    .AsNoTracking()
                    .FirstOrDefaultAsync(p => p.UserId == notification.TriggeredByUserId);

                var notificationDto = new FollowNotificationDto
                {
                    TriggeredByUserId = notification.TriggeredByUserId,
                    Message = notification.Message,
                    CreatedAt = notification.CreatedAt,
                    IsRead = notification.IsRead,
                    EventType = notification.EventType,
                    TargetUserId = notification.TargetUserId,
                    TriggeredByUserPhoto = triggeredByUser.ProfilePhoto
                };

                notificationDtos.Add(notificationDto);
            }

            return notificationDtos;
        }


        public async Task<ReplyNotificationDto> CreateReplyNotificationAsync(string triggeredByUserId, string targetUserId, int mediaId, int commentId, string commentText)
        {
            var triggeredByUser = await _context.ProfileInfo
                .AsNoTracking()
                .FirstOrDefaultAsync(p => p.UserId == triggeredByUserId);
            var targetUser = await _context.Users
                .AsNoTracking()
                .FirstOrDefaultAsync(u => u.Id == targetUserId);

            if (triggeredByUser == null || targetUser == null)
            {
                throw new Exception("Perfil de usuário não encontrado.");
            }

            var mediaInfo = await _context.MediaInfoModel
             .AsNoTracking()
             .FirstOrDefaultAsync(p => p.IdMedia == mediaId);
            var comment = await _context.Comments
                .AsNoTracking()
                .FirstOrDefaultAsync(u => u.Id == commentId);

            if (mediaInfo == null || comment == null)
            {
                throw new Exception("A mídia ou comentário relacionados não foram encontrados.");
            }

            string message = $"{triggeredByUser.UserName} respondeu ao seu comentário com: \"{commentText}\"";

            var replyNotification = new ReplyNotification
            {
                NotificationId = Guid.NewGuid(),
                TriggeredByUserId = triggeredByUserId,
                TargetUserId = targetUserId,
                Message = message,
                CreatedAt = DateTime.UtcNow,
                IsRead = false,
                EventType = "Reply",
                IdTableMedia = mediaInfo.IdTableMedia,
                IdComment = commentId,
            };

            var replyNotificationDto = new ReplyNotificationDto
            {
                TriggeredByUserId = triggeredByUserId,
                Message = replyNotification.Message,
                CreatedAt = replyNotification.CreatedAt,
                IsRead = replyNotification.IsRead,
                EventType = replyNotification.EventType,
                MediaId = mediaInfo.IdMedia,
                MediaType = mediaInfo.Type,
                CommentId = comment.Id,
                TargetUserId = targetUserId,
                TriggeredByUserPhoto = triggeredByUser.ProfilePhoto
            };

            await _context.ReplyNotifications.AddAsync(replyNotification);
            await _context.SaveChangesAsync();

            return replyNotificationDto;
        }

        public async Task<List<ReplyNotificationDto>> GetReplyNotificationsForUserAsync(string userId)
        {
            var notifications = await _context.ReplyNotifications
                .Where(n => n.TargetUserId == userId)
                .ToListAsync();

            var notificationDtos = new List<ReplyNotificationDto>();

            foreach (var notification in notifications)
            {
                var triggeredByUser = await _context.ProfileInfo
                    .AsNoTracking()
                    .FirstOrDefaultAsync(p => p.UserId == notification.TriggeredByUserId);
                var mediaInfo = await _context.MediaInfoModel
                    .AsNoTracking()
                    .FirstOrDefaultAsync(m => m.IdTableMedia == notification.IdTableMedia);
                var commentInfo = await _context.Comments
                   .AsNoTracking()
                   .FirstOrDefaultAsync(m => m.Id == notification.IdComment);

                var notificationDto = new ReplyNotificationDto
                {
                    TriggeredByUserId = notification.TriggeredByUserId,
                    Message = notification.Message,
                    CreatedAt = notification.CreatedAt,
                    IsRead = notification.IsRead,
                    EventType = notification.EventType,
                    MediaId = mediaInfo.IdMedia,
                    MediaType = mediaInfo.Type,
                    CommentId = commentInfo.Id,
                    TargetUserId = notification.TargetUserId,
                    TriggeredByUserPhoto = triggeredByUser.ProfilePhoto,
                };

                notificationDtos.Add(notificationDto);
            }

            return notificationDtos;
        }


        public async Task MarkAllFollowNotificationsAsReadAsync(string username)
        {
            var user = await _context.Users
                .Where(u => u.UserName == username)
                .SingleOrDefaultAsync();

            if (user != null)
            {
                var followNotifications = await _context.FollowNotifications
                    .Where(n => n.TargetUserId == user.Id && !n.IsRead)
                    .ToListAsync();

                foreach (var notification in followNotifications)
                {
                    notification.IsRead = true;
                }

                await _context.SaveChangesAsync();
            }
        }

        public async Task MarkAllReplyNotificationsAsReadAsync(string username)
        {
            var user = await _context.Users
                .Where(u => u.UserName == username)
                .SingleOrDefaultAsync();

            if (user != null)
            {
                var replyNotifications = await _context.ReplyNotifications
                    .Where(n => n.TargetUserId == user.Id && !n.IsRead)
                    .ToListAsync();

                foreach (var notification in replyNotifications)
                {
                    notification.IsRead = true;
                }

                await _context.SaveChangesAsync();
            }
        }

        public async Task MarkAllAchievementNotificationsAsReadAsync(string username)
        {
            var user = await _context.Users.SingleOrDefaultAsync(u => u.UserName == username);
            if (user != null)
            {
                var achievementNotifications = await _context.AchievementNotifications
                    .Where(n => n.TriggeredByUserId == user.Id && !n.IsRead)
                    .ToListAsync();

                foreach (var notification in achievementNotifications)
                {
                    notification.IsRead = true;
                }

                await _context.SaveChangesAsync();
            }
        }

        public async Task MarkAllMessageNotificationsAsReadAsync(string username)
        {
            var user = await _context.Users.SingleOrDefaultAsync(u => u.UserName == username);
            if (user != null)
            {
                var messageNotifications = await _context.MessageNotifications
                    .Where(n => n.TriggeredByUserId == user.Id && !n.IsRead)
                    .ToListAsync();

                foreach (var notification in messageNotifications)
                {
                    notification.IsRead = true;
                }

                await _context.SaveChangesAsync();
            }
        }


        public async Task ClearNotificationsForUserAsync(string username)
        {
            var user = await _context.Users
                .Where(u => u.UserName == username)
                .SingleOrDefaultAsync();

            if (user != null)
            {
                var followNotifications = await _context.FollowNotifications
                    .Where(n => n.TargetUserId == user.Id)
                    .ToListAsync();

                var replyNotifications = await _context.ReplyNotifications
                    .Where(n => n.TargetUserId == user.Id)
                    .ToListAsync();

                var achievementNotifications = await _context.AchievementNotifications
                    .Where(n => n.TriggeredByUserId == user.Id)
                    .ToListAsync();

                var messagetNotifications = await _context.MessageNotifications
                   .Where(n => n.TargetUserId == user.Id)
                   .ToListAsync();

                _context.FollowNotifications.RemoveRange(followNotifications);
                _context.ReplyNotifications.RemoveRange(replyNotifications);
                _context.AchievementNotifications.RemoveRange(achievementNotifications);
                _context.MessageNotifications.RemoveRange(messagetNotifications);

                await _context.SaveChangesAsync();
            }
        }

        public async Task<bool> HasUnreadNotificationsAsync(string username)
        {
            var user = await _context.Users
                .Where(u => u.UserName == username)
                .SingleOrDefaultAsync();

            if (user == null) return false;

            bool hasUnreadFollowNotifications = await _context.FollowNotifications
                .AnyAsync(n => n.TargetUserId == user.Id && !n.IsRead);

            bool hasUnreadReplyNotifications = await _context.ReplyNotifications
                .AnyAsync(n => n.TargetUserId == user.Id && !n.IsRead);

            bool hasUnreadAchievementyNotifications = await _context.AchievementNotifications
                .AnyAsync(n => n.TriggeredByUserId == user.Id && !n.IsRead);

            bool hasUnreadMessageNotifications = await _context.MessageNotifications
                .AnyAsync(n => n.TriggeredByUserId == user.Id && !n.IsRead);

            return hasUnreadFollowNotifications || hasUnreadReplyNotifications || hasUnreadAchievementyNotifications || hasUnreadMessageNotifications;
        }

        public async Task<AchievementNotificationDto> CreateAchievementNotificationAsync(string triggeredByUserId, int medalId)
        {
            var user = await _context.ProfileInfo
              .AsNoTracking()
              .FirstOrDefaultAsync(u => u.UserId == triggeredByUserId);

            var medal = await _context.Medals
                .AsNoTracking()
                .FirstOrDefaultAsync(m => m.Id == medalId);

            if (medal == null || user == null)
            {
                throw new Exception("Medalha ou usuário não encontrados.");
            }

            string message = $"Desbloqueaste a medalha: {medal.Name}";

            var notification = new AchievementNotification
            {
                NotificationId = Guid.NewGuid(),
                TriggeredByUserId = triggeredByUserId,
                Message = message,
                CreatedAt = DateTime.UtcNow,
                IsRead = false,
                EventType = "Achievement",
                UserMedalId = medalId
            };

            var achievementNotificationDto = new AchievementNotificationDto
            {
                TriggeredByUserId = notification.TriggeredByUserId,
                Message = notification.Message,
                CreatedAt = notification.CreatedAt,
                IsRead = notification.IsRead,
                EventType = notification.EventType,
                UserMedalId = medalId,
                AchievementPhoto = medal.Image
            };

            await _context.AchievementNotifications.AddAsync(notification);
            await _context.SaveChangesAsync();

            return achievementNotificationDto;
        }

        public async Task<List<AchievementNotificationDto>> GetAchievementNotificationsForUserAsync(string userId)
        {
            var notifications = await _context.AchievementNotifications
                .Where(n => n.TriggeredByUserId == userId)
                .ToListAsync();

            var notificationDtos = new List<AchievementNotificationDto>();

            foreach (var notification in notifications)
            {
                var triggeredByUser = await _context.ProfileInfo
                    .AsNoTracking()
                    .FirstOrDefaultAsync(p => p.UserId == notification.TriggeredByUserId);
                var medal = await _context.Medals
                    .AsNoTracking()
                    .FirstOrDefaultAsync(m => m.Id == notification.UserMedalId);

                var notificationDto = new AchievementNotificationDto
                {
                    TriggeredByUserId = notification.TriggeredByUserId,
                    Message = notification.Message,
                    CreatedAt = notification.CreatedAt,
                    IsRead = notification.IsRead,
                    EventType = notification.EventType,
                    UserMedalId = medal.Id,
                    AchievementPhoto = medal.Image
                };

                notificationDtos.Add(notificationDto);
            }

            return notificationDtos;
        }


        public async Task<MessageNotificationDto> CreateMessageNotificationAsync(string triggeredByUserId, string targetUserId)
        {
            var triggeredByUser = await _context.ProfileInfo
                .AsNoTracking()
                .FirstOrDefaultAsync(p => p.UserId == triggeredByUserId);
            var targetUser = await _context.ProfileInfo
                .AsNoTracking()
                .FirstOrDefaultAsync(u => u.UserId == targetUserId);

            if (triggeredByUser == null || targetUser == null)
            {
                throw new Exception("Perfil de usuário não encontrado.");
            }

            var lastMessage = await _context.Messages
                .Where(m => m.SendUserId == triggeredByUserId)
                .OrderByDescending(m => m.SentAt)
                .FirstOrDefaultAsync();

            if (lastMessage == null)
            {
                throw new Exception("Nenhuma mensagem encontrada para criar notificação.");
            }

            var messageStatus = await _context.MessagesStatus
                .FirstOrDefaultAsync(ms => ms.MessageId == lastMessage.Id);

            if (messageStatus == null)
            {
                throw new Exception("Status da mensagem não encontrado.");
            }

            var notification = new MessageNotification
            {
                NotificationId = Guid.NewGuid(),
                TriggeredByUserId = triggeredByUserId,
                Message = $"{lastMessage.SendUser.UserName} enviou-te uma mensagem",
                CreatedAt = DateTime.UtcNow,
                IsRead = false,
                EventType = "Message",
                MessageId = lastMessage.Id,
                TargetUserId = messageStatus.RecipientUserId,


            };

            await _context.MessageNotifications.AddAsync(notification);
            await _context.SaveChangesAsync();

            return new MessageNotificationDto
            {
                TriggeredByUserId = notification.TriggeredByUserId,
                Message = notification.Message,
                CreatedAt = notification.CreatedAt,
                IsRead = notification.IsRead,
                EventType = notification.EventType,
                TargetUserId = notification.TargetUserId,
                TriggeredByUserPhoto = triggeredByUser.ProfilePhoto
            };
        }


        public async Task<List<MessageNotificationDto>> GetMessageNotificationsForUserAsync(string targetUserId)
        {
            var notifications = await _context.MessageNotifications
                .Where(n => n.TargetUserId == targetUserId)
                .ToListAsync();

            var notificationDtos = new List<MessageNotificationDto>();

            foreach (var notification in notifications)
            {
                var triggeredByUser = await _context.ProfileInfo
                    .AsNoTracking()
                    .FirstOrDefaultAsync(p => p.UserId == notification.TriggeredByUserId);

                var notificationDto = new MessageNotificationDto
                {
                    TriggeredByUserId = notification.TriggeredByUserId,
                    Message = notification.Message,
                    CreatedAt = notification.CreatedAt,
                    IsRead = notification.IsRead,
                    EventType = notification.EventType,
                    TargetUserId = notification.TargetUserId,
                    TriggeredByUserPhoto = triggeredByUser.ProfilePhoto
                };

                notificationDtos.Add(notificationDto);
            }

            return notificationDtos;
        }








    }
}
