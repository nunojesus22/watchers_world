using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Identity;
using Microsoft.AspNetCore.Mvc;
using System.Security.Claims;
using System.Threading.Tasks;
using WatchersWorld.Server.DTOs.Notifications;
using WatchersWorld.Server.Models.Authentication;
using WatchersWorld.Server.Services;

namespace WatchersWorld.Server.Controllers
{
    [Authorize]
    [Route("api/[controller]")]
    [ApiController]
    public class NotificationsController : ControllerBase
    {
        private readonly UserManager<User> _userManager;
        private readonly INotificationService _notificationService;

        public NotificationsController(UserManager<User> userManager, INotificationService notificationService)
        {
            _userManager = userManager;
            _notificationService = notificationService;
        }

        [HttpGet("followNotifications/{authenticatedUsername}")]
        public async Task<IActionResult> GetMyFollowNotifications(string authenticatedUsername)
        {
            var userAuthenticated = await _userManager.FindByNameAsync(authenticatedUsername);
            if (userAuthenticated == null)
            {
                return NotFound(new { message = $"Usuário autenticado '{authenticatedUsername}' não encontrado." });
            }

            var userIdAuthenticated = userAuthenticated.Id;
            var notifications = await _notificationService.GetFollowNotificationsForUserAsync(userIdAuthenticated);

            return Ok(notifications ?? new List<FollowNotificationDto>());
        }

        [HttpGet("replyNotifications/{authenticatedUsername}")]
        public async Task<IActionResult> GetMyReplyNotifications(string authenticatedUsername)
        {
            var userAuthenticated = await _userManager.FindByNameAsync(authenticatedUsername);
            if (userAuthenticated == null)
            {
                return NotFound(new { message = $"Usuário autenticado '{authenticatedUsername}' não encontrado." });
            }

            var userIdAuthenticated = userAuthenticated.Id;
            var notifications = await _notificationService.GetReplyNotificationsForUserAsync(userIdAuthenticated);

            return Ok(notifications ?? new List<ReplyNotificationDto>());
        }


        [HttpPost("followNotifications/mark-all-as-read/{username}")]
        public async Task<IActionResult> MarkAllFollowNotificationsAsRead(string username)
        {
            await _notificationService.MarkAllFollowNotificationsAsReadAsync(username);
            return Ok(new { message = "Todas as notificações de seguimento foram marcadas como lidas." });
        }

        [HttpPost("replyNotifications/mark-all-as-read/{username}")]
        public async Task<IActionResult> MarkAllReplyNotificationsAsRead(string username)
        {
            await _notificationService.MarkAllReplyNotificationsAsReadAsync(username);
            return Ok(new { message = "Todas as notificações de resposta foram marcadas como lidas." });
        }

        [HttpDelete("clearNotifications/{username}")]
        public async Task<IActionResult> ClearNotifications(string username)
        {
            await _notificationService.ClearNotificationsForUserAsync(username);
            return Ok(new { message = "Notificações limpas com sucesso." });
        }

        [HttpGet("hasUnread/{username}")]
        public async Task<IActionResult> HasUnreadNotifications(string username)
        {
            bool hasUnread = await _notificationService.HasUnreadNotificationsAsync(username);
            return Ok(new { HasUnread = hasUnread });
        }

        [HttpGet("achievementNotifications/{authenticatedUsername}")]
        public async Task<IActionResult> GetMyAchievementNotifications(string authenticatedUsername)
        {
            var userAuthenticated = await _userManager.FindByNameAsync(authenticatedUsername);
            if (userAuthenticated == null)
            {
                return NotFound(new { message = $"Usuário autenticado '{authenticatedUsername}' não encontrado." });
            }

            var userIdAuthenticated = userAuthenticated.Id;
            var notifications = await _notificationService.GetAchievementNotificationsForUserAsync(userIdAuthenticated);

            return Ok(notifications);
        }

        [HttpGet("messageNotifications/{authenticatedUsername}")]
        public async Task<IActionResult> GetMyMessageNotifications(string authenticatedUsername)
        {
            var userAuthenticated = await _userManager.FindByNameAsync(authenticatedUsername);
            if (userAuthenticated == null)
            {
                return NotFound(new { message = $"Usuário autenticado '{authenticatedUsername}' não encontrado." });
            }

            var userIdAuthenticated = userAuthenticated.Id;
            var notifications = await _notificationService.GetMessageNotificationsForUserAsync(userIdAuthenticated);

            return Ok(notifications);
        }

        [HttpPost("achievementNotifications/mark-all-as-read/{username}")]
        public async Task<IActionResult> MarkAllAchievementNotificationsAsRead(string username)
        {
            await _notificationService.MarkAllAchievementNotificationsAsReadAsync(username);
            return Ok(new { message = "All achievement notifications have been marked as read." });
        }

        [HttpPost("messageNotifications/mark-all-as-read/{username}")]
        public async Task<IActionResult> MarkAllMessageNotificationsAsRead(string username)
        {
            await _notificationService.MarkAllMessageNotificationsAsReadAsync(username);
            return Ok(new { message = "All message notifications have been marked as read." });
        }

        [HttpPost("notify-new-episode")]
        public async Task<IActionResult> NotifyNewEpisode([FromBody] MediaNotificationDto notificationDto)
        {
            try
            {
                await _notificationService.CreateMediaNotificationAsync(notificationDto.TriggeredByUserId, notificationDto.UserMediaId, notificationDto.MediaName, notificationDto.MediaPhoto);
                return Ok();
            }
            catch (Exception ex)
            {
                // Trate a exceção conforme necessário
                return StatusCode(500, ex.Message);
            }
        }

        [HttpGet("mediaNotifications/{authenticatedUsername}")]
        public async Task<IActionResult> GetMyMediaNotifications(string authenticatedUsername, [FromQuery] string mediaName, [FromQuery] string mediaPhoto)
        {
            var userAuthenticated = await _userManager.FindByNameAsync(authenticatedUsername);
            if (userAuthenticated == null)
            {
                return NotFound(new { message = $"Usuário autenticado '{authenticatedUsername}' não encontrado." });
            }

            var userIdAuthenticated = userAuthenticated.Id;
            var notifications = await _notificationService.GetMediaNotificationsForUserAsync(userIdAuthenticated, mediaName, mediaPhoto);

            return Ok(notifications);
        }


    }
}
