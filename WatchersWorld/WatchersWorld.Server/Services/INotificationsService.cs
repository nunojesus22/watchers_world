﻿using Microsoft.EntityFrameworkCore;
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

        Task<MediaNotificationDto> CreateMediaNotificationAsync(string triggeredByUserId, int idTableMedia, string mediaName, string mediaPhoto);

        Task<List<MediaNotificationDto>> GetMediaNotificationsForUserAsync(string userId, string mediaName, string mediaPhoto);

        Task MarkAllMediaNotificationsAsReadAsync(string username);
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
            var triggeredByUser = await _context.ProfileInfo
                .AsNoTracking()
                .FirstOrDefaultAsync(p => p.UserId == triggeredByUserId);
            var targetUser = await _context.ProfileInfo
                .AsNoTracking()
                .FirstOrDefaultAsync(u => u.UserId == targetUserId);

            if (triggeredByUser == null || targetUser == null)
            {
                throw new NullReferenceException("Perfil de utilizador não encontrado.");
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
                throw new NullReferenceException("Perfil de usuário não encontrado.");
            }

            var mediaInfo = await _context.MediaInfoModel
             .AsNoTracking()
             .FirstOrDefaultAsync(p => p.IdMedia == mediaId);
            var comment = await _context.Comments
                .AsNoTracking()
                .FirstOrDefaultAsync(u => u.Id == commentId);

            if (mediaInfo == null || comment == null)
            {
                throw new NullReferenceException("A mídia ou comentário relacionados não foram encontrados.");
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
                    .Where(n => n.TargetUserId == user.Id && !n.IsRead)
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

                var mediaNotifications = await _context.MediaNotifications
                  .Where(n => n.UserMedia.UserId == user.Id)
                  .ToListAsync();

                _context.FollowNotifications.RemoveRange(followNotifications);
                _context.ReplyNotifications.RemoveRange(replyNotifications);
                _context.AchievementNotifications.RemoveRange(achievementNotifications);
                _context.MessageNotifications.RemoveRange(messagetNotifications);
                _context.MediaNotifications.RemoveRange(mediaNotifications);


                await _context.SaveChangesAsync();
            }
        }

        public async Task<bool> HasUnreadNotificationsAsync(string username)
        {
            var user = await _context.Users
                .Where(u => u.UserName == username)
                .SingleOrDefaultAsync();

            if (user == null)
            {
                throw new NullReferenceException("Perfil de utilizador não encontrado.");
            }

            bool hasUnreadFollowNotifications = await _context.FollowNotifications
                .AnyAsync(n => n.TargetUserId == user.Id && !n.IsRead);

            bool hasUnreadReplyNotifications = await _context.ReplyNotifications
                .AnyAsync(n => n.TargetUserId == user.Id && !n.IsRead);

            bool hasUnreadAchievementyNotifications = await _context.AchievementNotifications
                .AnyAsync(n => n.TriggeredByUserId == user.Id && !n.IsRead);

            bool hasUnreadMessageNotifications = await _context.MessageNotifications
                .AnyAsync(n => n.TargetUserId == user.Id && !n.IsRead);

            bool hasUnreadMediaNotifications = await _context.MediaNotifications
                .AnyAsync(n => n.UserMedia.UserId == user.Id && !n.IsRead);

            return hasUnreadFollowNotifications || hasUnreadReplyNotifications || hasUnreadAchievementyNotifications || hasUnreadMessageNotifications || hasUnreadMediaNotifications;
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
                throw new NullReferenceException("Medalha ou usuário não encontrados.");
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
                throw new NullReferenceException("Perfil de utilizador não encontrado.");
            }

            var lastMessage = await _context.Messages
                .Where(m => m.SendUserId == triggeredByUserId)
                .OrderByDescending(m => m.SentAt)
                .FirstOrDefaultAsync();

            if (lastMessage == null)
            {
                throw new NullReferenceException("Nenhuma mensagem encontrada para criar notificação.");
            }

            var messageStatus = await _context.MessagesStatus
                .FirstOrDefaultAsync(ms => ms.MessageId == lastMessage.Id);

            if (messageStatus == null)
            {
                throw new NullReferenceException("Status da mensagem não encontrado.");
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

        public async Task<MediaNotificationDto> CreateMediaNotificationAsync(string triggeredByUserId, int mediaId, string mediaName, string mediaPhoto)
        {
            var userMediaEntries = await _context.UserMedia
          .AsNoTracking()
          .Include(um => um.MediaInfoModel)
          .Where(um => um.MediaInfoModel.IdMedia == mediaId)
          .ToListAsync();

            if (!userMediaEntries.Any())
            {
                throw new NullReferenceException("UserMedia correspondente ao mediaId não encontrado.");
            }

            var userMedia = userMediaEntries.FirstOrDefault();

            var existingNotification = await _context.MediaNotifications
                .AnyAsync(n => n.TriggeredByUserId == triggeredByUserId && n.Message == $"Um novo episódio de {mediaName} está disponível!" && n.UserMediaId == userMedia.Id);

            if (existingNotification)
            {
                return null;
            }

            var notification = new MediaNotification
            {
                NotificationId = Guid.NewGuid(),
                TriggeredByUserId = triggeredByUserId,
                Message = $"Um novo episódio de {mediaName} está disponível!",
                CreatedAt = DateTime.UtcNow,
                IsRead = false,
                EventType = "NewMedia",
                UserMediaId = userMedia.Id
            };

            await _context.MediaNotifications.AddAsync(notification);
            await _context.SaveChangesAsync();

            return new MediaNotificationDto
            {
                TriggeredByUserId = triggeredByUserId,
                Message = notification.Message,
                CreatedAt = notification.CreatedAt,
                IsRead = notification.IsRead,
                EventType = notification.EventType,
                MediaName = mediaName,
                MediaPhoto = mediaPhoto,
                UserMediaId = userMedia.Id,
                MediaId = userMedia.MediaInfoModel.IdMedia
            };
        }


        public async Task<List<MediaNotificationDto>> GetMediaNotificationsForUserAsync(string userId, string mediaName, string mediaPhoto)
        {
            var notifications = await _context.MediaNotifications
                .Where(n => n.UserMedia.UserId == userId)
                .Include(n => n.UserMedia)
                .ThenInclude(um => um.MediaInfoModel)
                .Select(n => new MediaNotificationDto
                {
                    TriggeredByUserId = n.TriggeredByUserId,
                    Message = n.Message,
                    CreatedAt = n.CreatedAt,
                    IsRead = n.IsRead,
                    EventType = n.EventType,
                    MediaName = mediaName,
                    MediaPhoto = mediaPhoto,
                    UserMediaId = n.UserMediaId,
                    MediaId = n.UserMedia.MediaInfoModel.IdMedia
                })
                .ToListAsync();

            return notifications;
        }

        public async Task MarkAllMediaNotificationsAsReadAsync(string username)
        {
            var user = await _context.Users.SingleOrDefaultAsync(u => u.UserName == username);
            if (user != null)
            {
                var mediaNotifications = await _context.MediaNotifications
                    .Where(n => n.UserMedia.UserId == user.Id && !n.IsRead)
                    .ToListAsync();

                foreach (var notification in mediaNotifications)
                {
                    notification.IsRead = true;
                }

                await _context.SaveChangesAsync();
            }
        }










    }
}
