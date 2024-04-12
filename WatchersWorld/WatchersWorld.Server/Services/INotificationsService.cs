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
    /// Interface que define operações para a gestão de notificações.
    /// </summary>
    public interface INotificationService
    {
        /// <summary>
        /// Cria e armazena uma notificação de seguimento.
        /// </summary>
        /// <param name="triggeredByUserId">Identificador do utilizador que iniciou o seguimento.</param>
        /// <param name="targetUserId">Identificador do utilizador alvo que receberá a notificação.</param>
        /// <returns>O DTO da notificação de seguimento criada.</returns>
        Task<FollowNotificationDto> CreateFollowNotificationAsync(string triggeredByUserId, string targetUserId);

        /// <summary>
        /// Obtém todas as notificações de seguimento para um dado utilizador.
        /// </summary>
        /// <param name="targetUserId">Identificador do utilizador alvo.</param>
        /// <returns>Uma lista de DTOs de notificações de seguimento.</returns>
        Task<List<FollowNotificationDto>> GetFollowNotificationsForUserAsync(string targetUserId);

        /// <summary>
        /// Cria uma notificação de resposta para um utilizador.
        /// </summary>
        /// <param name="triggeredByUserId">O identificador do utilizador que iniciou a resposta.</param>
        /// <param name="targetUserId">O identificador do utilizador alvo da notificação.</param>
        /// <param name="mediaId">O identificador do media relacionado com a resposta.</param>
        /// <param name="commentId">O identificador do comentário que é objeto da resposta.</param>
        /// <param name="commentText">O texto do comentário que foi respondido.</param>
        /// <returns>Um DTO de notificação de resposta.</returns>
        Task<ReplyNotificationDto> CreateReplyNotificationAsync(string triggeredByUserId, string targetUserId, int mediaId, int commentId, string commentText);

        /// <summary>
        /// Obtém todas as notificações de resposta a comentários para um dado utilizador.
        /// </summary>
        /// <param name="targetUserId">Identificador do utilizador alvo.</param>
        /// <returns>Uma lista de DTOs de notificações de respostas a comentários.</returns>
        Task<List<ReplyNotificationDto>> GetReplyNotificationsForUserAsync(string targetUserId);

        /// <summary>
        /// Marca todas as notificações de seguimento de um utilizador como lidas.
        /// </summary>
        /// <param name="username">O nome de utilizador cujas notificações de seguimento serão marcadas como lidas.</param>
        /// <returns>Uma tarefa que representa a operação assíncrona.</returns>
        Task MarkAllFollowNotificationsAsReadAsync(string username);

        /// <summary>
        /// Marca todas as notificações de resposta a comentários de um utilizador como lidas.
        /// </summary>
        /// <param name="username">O nome de utilizador cujas notificações de resposta serão marcadas como lidas.</param>
        /// <returns>Uma tarefa que representa a operação assíncrona.</returns>
        Task MarkAllReplyNotificationsAsReadAsync(string username);

        /// <summary>
        /// Limpa todas as notificações associadas a um utilizador.
        /// </summary>
        /// <param name="username">O nome do utilizador para quem as notificações devem ser limpas.</param>
        /// <returns>Uma tarefa que representa a operação assíncrona.</returns>
        Task ClearNotificationsForUserAsync(string username);

        /// <summary>
        /// Verifica se existem notificações não lidas para um utilizador específico.
        /// </summary>
        /// <param name="username">O nome de utilizador para o qual verificar a existência de notificações não lidas.</param>
        /// <returns>Um valor booleano que é verdadeiro se existirem notificações não lidas e falso caso contrário.</returns>
        Task<bool> HasUnreadNotificationsAsync(string username);

        /// <summary>
        /// Cria uma notificação de conquista de uma medalha para um utilizador.
        /// </summary>
        /// <param name="triggeredByUserId">O identificador do utilizador que atingiu a conquista de uma medalha.</param>
        /// <param name="userMedalId">O identificador da medalha que foi conquistada.</param>
        /// <returns>Um DTO de notificação de conquista de uma medalha.</returns>
        Task<AchievementNotificationDto> CreateAchievementNotificationAsync(string triggeredByUserId, int userMedalId);

        /// <summary>
        /// Obtém todas as notificações de medalhas para um dado utilizador.
        /// </summary>
        /// <param name="targetUserId">Identificador do utilizador alvo.</param>
        /// <returns>Uma lista de DTOs de notificações de medalhas.</returns>
        Task<List<AchievementNotificationDto>> GetAchievementNotificationsForUserAsync(string userId);

        /// <summary>
        /// Marca todas as notificações de medalhas de um utilizador como lidas.
        /// </summary>
        /// <param name="username">O nome de utilizador cujas notificações de medalhas serão marcadas como lidas.</param>
        /// <returns>Uma tarefa que representa a operação assíncrona.</returns>
        Task MarkAllAchievementNotificationsAsReadAsync(string username);

        /// <summary>
        /// Cria uma notificação de mensagem para um utilizador.
        /// </summary>
        /// <param name="triggeredByUserId">O identificador do utilizador que enviou a mensagem.</param>
        /// <param name="targetUserId">O identificador do utilizador destinatário da mensagem.</param>
        /// <returns>Um DTO de notificação de mensagem.</returns>
        Task<MessageNotificationDto> CreateMessageNotificationAsync(string triggeredByUserId, string targetUserId);

        /// <summary>
        /// Obtém todas as notificações de mensagens para um dado utilizador.
        /// </summary>
        /// <param name="targetUserId">Identificador do utilizador alvo.</param>
        /// <returns>Uma lista de DTOs de notificações de mensagens.</returns>
        Task<List<MessageNotificationDto>> GetMessageNotificationsForUserAsync(string targetUserId);

        /// <summary>
        /// Marca todas as notificações de mensagens de um utilizador como lidas.
        /// </summary>
        /// <param name="username">O nome de utilizador cujas notificações de mensagem serão marcadas como lidas.</param>
        /// <returns>Uma tarefa que representa a operação assíncrona.</returns>
        Task MarkAllMessageNotificationsAsReadAsync(string username);

        /// <summary>
        /// Cria uma notificação de mídia nova e a associa ao utilizador especificado.
        /// </summary>
        /// <param name="triggeredByUserId">O identificador do utilizador que acionou o evento.</param>
        /// <param name="mediaId">O identificador da mídia associada à notificação.</param>
        /// <param name="mediaName">O nome da mídia associada à notificação.</param>
        /// <param name="mediaPhoto">O caminho para a foto da mídia associada à notificação.</param>
        /// <returns>Um DTO contendo os detalhes da notificação de mídia criada.</returns>
        Task<MediaNotificationDto> CreateMediaNotificationAsync(string triggeredByUserId, int idTableMedia, string mediaName, string mediaPhoto);

        /// <summary>
        /// Obtém uma lista de notificações de mídia para um utilizador específico.
        /// </summary>
        /// <param name="userId">O identificador do utilizador para o qual obter as notificações.</param>
        /// <param name="mediaName">O nome da mídia a ser utilizado na montagem da mensagem da notificação.</param>
        /// <param name="mediaPhoto">O caminho para a foto da mídia a ser utilizado na notificação.</param>
        /// <returns>Uma lista de DTOs representando as notificações de mídia do utilizador.</returns>
        Task<List<MediaNotificationDto>> GetMediaNotificationsForUserAsync(string userId, string mediaName, string mediaPhoto);

        /// <summary>
        /// Marca todas as notificações de novos episódios de um utilizador como lidas.
        /// </summary>
        /// <param name="username">O nome de utilizador cujas notificações de novos episódios de medias serão marcadas como lidas.</param>
        /// <returns>Uma tarefa que representa a operação assíncrona.</returns>
        Task MarkAllMediaNotificationsAsReadAsync(string username);
    }

    /// <summary>
    /// Serviço para a gestão de seguidores.
    /// </summary>
    /// <remarks>
    /// Inicializa uma nova instância da classe <see cref="NotificationService"/>.
    /// </remarks>
    /// <param name="context">O contexto da base de dados.</param>
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
                throw new NullReferenceException("Perfil de utilizador não encontrado.");
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
                throw new NullReferenceException("Medalha ou utilizador não encontrados.");
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
