using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Identity;
using Microsoft.AspNetCore.Mvc;
using System.Security.Claims;
using System.Threading.Tasks;
using WatchersWorld.Server.DTOs;
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

        [HttpPost("create-notification/{usernameToFollow}")]
        public async Task<IActionResult> CreateNotification([FromBody] NotificationDto notificationDto, string usernameToFollow)
        {
            var triggeredByUser = await _userManager.FindByNameAsync(notificationDto.TriggeredByUserName);
            if (triggeredByUser == null) return NotFound("Usuário que disparou a notificação não encontrado.");

            var targetUser = await _userManager.FindByNameAsync(usernameToFollow);
            if (targetUser == null) return NotFound("Usuário que deve receber a notificação não encontrado.");

            await _notificationService.CreateFollowNotificationAsync(triggeredByUser.Id, targetUser.Id);
            return Ok(new { message = "Notificação de novo seguidor criada com sucesso." });
        }


        // Método para obter todas as notificações não lidas para o usuário logado
        [HttpGet("my-notifications")]
        public async Task<IActionResult> GetMyNotifications()
        {
            // O ID do usuário é obtido do token de autenticação (usuário logado)
            var targetUserId = User.FindFirstValue(ClaimTypes.NameIdentifier);
            if (targetUserId == null) return Unauthorized();

            // Busca notificações onde o usuário logado é o destinatário
            var notifications = await _notificationService.GetNotificationsForUserAsync(targetUserId);
            return Ok(notifications);
        }

        // Método para marcar uma notificação específica como lida
        [HttpPost("mark-as-read/{notificationId}")]
        public async Task<IActionResult> MarkNotificationAsRead(Guid notificationId)
        {
            await _notificationService.MarkNotificationAsReadAsync(notificationId);
            return Ok(new { message = "Notificação marcada como lida com sucesso." });
        }
    }
}
