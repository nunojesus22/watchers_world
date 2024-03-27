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

        Task CreateReplyNotificationAsync(string triggeredByUserId, string targetUserId, int mediaId, int commentId, string commentText);

        Task<List<ReplyNotificationDto>> GetReplyNotificationsForUserAsync(string targetUserId);

        Task MarkAllFollowNotificationsAsReadAsync(string username);

        Task MarkAllReplyNotificationsAsReadAsync(string username);

        Task ClearNotificationsForUserAsync(string username);

        Task<bool> HasUnreadNotificationsAsync(string username);
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
            var targetUser = await _context.Users
                .AsNoTracking()
                .FirstOrDefaultAsync(u => u.Id == targetUserId);

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
                TriggeredByUserPhoto = triggeredByUser.ProfilePhoto
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
                .Select(n => new FollowNotificationDto
                {
                    TriggeredByUserId = n.TriggeredByUserId,
                    Message = n.Message,
                    CreatedAt = n.CreatedAt,
                    IsRead = n.IsRead,
                    EventType = n.EventType,
                    TargetUserId = n.TargetUserId,
                    TriggeredByUserPhoto = n.TriggeredByUserPhoto
                })
                .ToListAsync();

            return notifications;
        }

        public async Task CreateReplyNotificationAsync(string triggeredByUserId, string targetUserId, int mediaId, int commentId, string commentText)
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

            if (triggeredByUser == null || targetUser == null)
            {
                throw new Exception("Não foi possível encontrar os perfis dos usuários envolvidos.");
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
                MediaId = mediaId,
                CommentId = commentId,
                TriggeredByUserPhoto = triggeredByUser.ProfilePhoto

            };

            await _context.ReplyNotifications.AddAsync(replyNotification);
            await _context.SaveChangesAsync();
        }

        public async Task<List<ReplyNotificationDto>> GetReplyNotificationsForUserAsync(string userId)
        {
            var notifications = await _context.ReplyNotifications
                .Where(n => n.TargetUserId == userId)
                .Join(_context.MediaInfoModel,
                      notification => notification.MediaId,
                      mediaInfo => mediaInfo.IdMedia,
                      (notification, mediaInfo) => new { notification, mediaInfo })
                .Select(joined => new ReplyNotificationDto
                {
                    TriggeredByUserId = joined.notification.TriggeredByUserId,
                    Message = joined.notification.Message,
                    CreatedAt = joined.notification.CreatedAt,
                    IsRead = joined.notification.IsRead,
                    EventType = joined.notification.EventType,
                    MediaId = joined.notification.MediaId,
                    CommentId = joined.notification.CommentId,
                    TargetUserId = joined.notification.TargetUserId,
                    TriggeredByUserPhoto = joined.notification.TriggeredByUserPhoto,

                    MediaType = joined.mediaInfo.Type
                })
                .ToListAsync();

            return notifications;
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

                _context.FollowNotifications.RemoveRange(followNotifications);
                _context.ReplyNotifications.RemoveRange(replyNotifications);

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

            return hasUnreadFollowNotifications || hasUnreadReplyNotifications;
        }




    }
}
