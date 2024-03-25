using Microsoft.EntityFrameworkCore;
using System;
using System.Collections.Generic;
using System.Threading.Tasks;
using WatchersWorld.Server.Data;
using WatchersWorld.Server.DTOs;
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
        Task CreateFollowNotificationAsync(string triggeredByUserId, string targetUserId);

        /// <summary>
        /// Recupera todas as notificações não lidas destinadas a um usuário específico.
        /// </summary>
        /// <param name="userId">O identificador do usuário destinatário das notificações.</param>
        /// <returns>Uma lista de notificações.</returns>
        Task<List<NotificationDto>> GetNotificationsForUserAsync(string userId);

        /// <summary>
        /// Marca uma notificação específica como lida.
        /// </summary>
        /// <param name="notificationId">O identificador da notificação a ser marcada como lida.</param>
        Task MarkNotificationAsReadAsync(Guid notificationId);

        Task MarkAllNotificationsAsReadAsync(string userId);
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


        public async Task CreateFollowNotificationAsync(string triggeredByUserId, string targetUserId)
        {
            var triggeredByUserProfile = await _context.ProfileInfo
                .AsNoTracking()
                .FirstOrDefaultAsync(p => p.UserId == triggeredByUserId);
            if (triggeredByUserProfile == null)
                throw new Exception("Perfil do usuário que desencadeou a notificação não encontrado.");

            var notification = new Notification
            {
                NotificationId = Guid.NewGuid(),
                TriggeredByUserId = triggeredByUserId,
                TargetUserId = targetUserId,
                Message = $"{triggeredByUserProfile.UserName} começou-te a seguir!",
                CreatedAt = DateTime.UtcNow,
                IsRead = false,
                EventType = "NewFollower"
            };

            await _context.Notifications.AddAsync(notification);
            await _context.SaveChangesAsync();
        }


        public async Task<List<NotificationDto>> GetNotificationsForUserAsync(string userId)
        {
            var notifications = await _context.Notifications
                .Where(n => n.TargetUserId == userId && !n.IsRead)
                .ToListAsync();

            var notificationDtos = new List<NotificationDto>();

            foreach (var notification in notifications)
            {
                var triggeredByUserProfile = await _context.ProfileInfo
                    .AsNoTracking()
                    .FirstOrDefaultAsync(p => p.UserId == notification.TriggeredByUserId);

                if (triggeredByUserProfile != null)
                {
                    notificationDtos.Add(new NotificationDto
                    {
                        TriggeredByUserName = triggeredByUserProfile.UserName,
                        TriggeredByUserPhoto = triggeredByUserProfile.ProfilePhoto,
                        Message = notification.Message,
                        CreatedAt = notification.CreatedAt,
                        IsRead = notification.IsRead,
                        EventType = notification.EventType
                    });
                }
            }

            return notificationDtos;
        }

        public async Task MarkNotificationAsReadAsync(Guid notificationId)
        {
            var notification = await _context.Notifications.FindAsync(notificationId);
            if (notification != null)
            {
                notification.IsRead = true;
                _context.Notifications.Update(notification);
                await _context.SaveChangesAsync();
            }
        }

        public async Task MarkAllNotificationsAsReadAsync(string userId)
        {
            var notifications = await _context.Notifications
                .Where(n => n.TargetUserId == userId && !n.IsRead)
                .ToListAsync();

            foreach (var notification in notifications)
            {
                notification.IsRead = true;
            }

            await _context.SaveChangesAsync();
        }
    }
}
