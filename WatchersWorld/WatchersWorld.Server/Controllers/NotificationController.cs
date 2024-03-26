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

        [HttpPost("create-notification/{authenticatedUsername}/{usernameToFollow}")]
        public async Task<IActionResult> CreateFollowNotification(string authenticatedUsername, string usernameToFollow)
        {
            var userAuthenticated = await _userManager.FindByNameAsync(authenticatedUsername);
            if (userAuthenticated == null)
            {
                return NotFound($"Usuário autenticado '{authenticatedUsername}' não encontrado.");
            }

            var userIdAuthenticated = userAuthenticated.Id;

            var userToFollow = await _userManager.FindByNameAsync(usernameToFollow);
            if (userToFollow == null)
            {
                return NotFound($"Usuário a ser seguido '{usernameToFollow}' não encontrado.");
            }

            var userIdToFollow = userToFollow.Id;

            // Crie a notificação de seguimento e obtenha o DTO resultante
            var followNotificationDto = await _notificationService.CreateFollowNotificationAsync(userIdAuthenticated, userIdToFollow);
            // Agora você pode retornar o DTO diretamente
            return Ok(followNotificationDto);
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

            if (notifications == null || notifications.Count == 0)
            {
                return NotFound(new { message = "Notificações não encontradas." });
            }

            return Ok(notifications);
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

            if (notifications == null || notifications.Count == 0)
            {
                return NotFound(new { message = "Notificações de resposta não encontradas." });
            }

            return Ok(notifications);
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

    }
}
