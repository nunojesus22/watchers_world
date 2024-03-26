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

            // Criar notificação de follow
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


            // Crie o DTO para a notificação criada
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

            // Adicionar e salvar a notificação no banco de dados
            await _context.FollowNotifications.AddAsync(followNotification);
            await _context.SaveChangesAsync();

            // Retorne o DTO
            return followNotificationDto;
        }

        public async Task<List<FollowNotificationDto>> GetFollowNotificationsForUserAsync(string targetUserId)
        {
            var notifications = await _context.FollowNotifications
                .Where(n => n.TargetUserId == targetUserId && !n.IsRead)
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

            if (triggeredByUser == null || targetUser == null)
            {
                throw new Exception("Não foi possível encontrar os perfis dos usuários envolvidos.");
            }

            // Construa a mensagem. Considere limitar o comprimento do texto do comentário incluído na notificação
            string message = $"{triggeredByUser.UserName} respondeu ao seu comentário: \"{commentText}\"";

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

        public async Task<List<ReplyNotificationDto>> GetReplyNotificationsForUserAsync(string targetUserId)
        {
            var notifications = await _context.ReplyNotifications
                .Where(n => n.TargetUserId == targetUserId && !n.IsRead)
                .Select(n => new ReplyNotificationDto
                {
                    TriggeredByUserId = n.TriggeredByUserId,
                    Message = n.Message,
                    CreatedAt = n.CreatedAt,
                    IsRead = n.IsRead,
                    EventType = n.EventType,
                    MediaId = n.MediaId,
                    CommentId = n.CommentId,
                    TargetUseriD = n.TargetUserId,
                    TriggeredByUserPhoto = n.TriggeredByUserPhoto
                })
                .ToListAsync();

            return notifications;
        }


        //public async Task<List<NotificationDto>> GetNotificationsForUserAsync(string userId)
        //{
        //    var notificationDtos = new List<NotificationDto>();

        //    // Obter notificações de Follow
        //    var followNotifications = await _context.FollowNotifications
        //        .Where(n => n.TargetUserId == userId && !n.IsRead)
        //        .ToListAsync();

        //    foreach (var followNotification in followNotifications)
        //    {
        //        var triggeredByUser = await _context.ProfileInfo
        //            .AsNoTracking()
        //            .FirstOrDefaultAsync(p => p.UserId == followNotification.TriggeredByUserId);

        //        notificationDtos.Add(new FollowNotificationDto
        //        {
        //            TriggeredByUserId = followNotification.TriggeredByUserId,
        //            Message = followNotification.Message,
        //            CreatedAt = followNotification.CreatedAt,
        //            IsRead = followNotification.IsRead,
        //            EventType = followNotification.EventType,
        //            TargetUserId = followNotification.TargetUserId,
        //            TriggeredByUserPhoto = triggeredByUser?.ProfilePhoto
        //        });
        //    }

        //    return notificationDtos.OrderBy(n => n.CreatedAt).ToList();
        //}



        //public async Task MarkNotificationAsReadAsync(Guid notificationId)
        //{
        //    //var notification = await _context.Notifications.FindAsync(notificationId);
        //    //if (notification != null)
        //    //{
        //    //    notification.IsRead = true;
        //    //    _context.Notifications.Update(notification);
        //    //    await _context.SaveChangesAsync();
        //    //}
        //}

        //public async Task MarkAllNotificationsAsReadAsync(string userId)
        //{
        //    // Marcar notificações de Follow como lidas
        //    var followNotifications = await _context.Set<FollowNotification>()
        //        .Where(n => n.TargetUserId == userId && !n.IsRead)
        //        .ToListAsync();
        //    followNotifications.ForEach(n => n.IsRead = true);

        //    // Marcar notificações de Reply como lidas
        //    var replyNotifications = await _context.Set<ReplyNotification>()
        //        .Where(n => n.TargetUserId == userId && !n.IsRead)
        //        .ToListAsync();
        //    replyNotifications.ForEach(n => n.IsRead = true);

        //    // Salvar todas as alterações
        //    await _context.SaveChangesAsync();
        //}


    }
}
