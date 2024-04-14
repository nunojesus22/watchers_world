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
    /// <summary>
    /// Controlador responsável pela gestão de notificações dos utilizadores.
    /// Autenticação é requerida para acessar os endpoints deste controlador.
    /// </summary>
    [Authorize]
    [Route("api/[controller]")]
    [ApiController]
    public class NotificationsController : ControllerBase
    {
        private readonly UserManager<User> _userManager;
        private readonly INotificationService _notificationService;

        /// <summary>
        /// Construtor para inicializar os serviços utilizados no controlador.
        /// </summary>
        /// <param name="userManager">Serviço para gestão de utilizadores.</param>
        /// <param name="notificationService">Serviço para gestão de notificações.</param>
        public NotificationsController(UserManager<User> userManager, INotificationService notificationService)
        {
            _userManager = userManager;
            _notificationService = notificationService;
        }

        /// <summary>
        /// Obtém as notificações de seguimento do utilizador autenticado.
        /// </summary>
        /// <param name="authenticatedUsername">Nome do utilizador autenticado.</param>
        /// <returns>Lista de notificações de seguimento do utilizador.</returns>
        [HttpGet("followNotifications/{authenticatedUsername}")]
        public async Task<IActionResult> GetMyFollowNotifications(string authenticatedUsername)
        {
            var userAuthenticated = await _userManager.FindByNameAsync(authenticatedUsername);
            if (userAuthenticated == null)
            {
                return NotFound(new { message = $"utilizador autenticado '{authenticatedUsername}' não encontrado." });
            }

            var userIdAuthenticated = userAuthenticated.Id;
            var notifications = await _notificationService.GetFollowNotificationsForUserAsync(userIdAuthenticated);

            return Ok(notifications ?? new List<FollowNotificationDto>());
        }

        /// <summary>
        /// Obtém as notificações de respostas aos comentários do utilizador autenticado.
        /// </summary>
        /// <param name="authenticatedUsername">Nome do utilizador autenticado.</param>
        /// <returns>Lista de notificações de respostas do utilizador.</returns>
        [HttpGet("replyNotifications/{authenticatedUsername}")]
        public async Task<IActionResult> GetMyReplyNotifications(string authenticatedUsername)
        {
            var userAuthenticated = await _userManager.FindByNameAsync(authenticatedUsername);
            if (userAuthenticated == null)
            {
                return NotFound(new { message = $"utilizador autenticado '{authenticatedUsername}' não encontrado." });
            }

            var userIdAuthenticated = userAuthenticated.Id;
            var notifications = await _notificationService.GetReplyNotificationsForUserAsync(userIdAuthenticated);

            return Ok(notifications ?? new List<ReplyNotificationDto>());
        }

        /// <summary>
        /// Marca todas as notificações de seguimento como lidas para um determinado utilizador.
        /// </summary>
        /// <param name="username">Nome do utilizador.</param>
        /// <returns>Mensagem indicando o sucesso da operação.</returns>
        [HttpPost("followNotifications/mark-all-as-read/{username}")]
        public async Task<IActionResult> MarkAllFollowNotificationsAsRead(string username)
        {
            await _notificationService.MarkAllFollowNotificationsAsReadAsync(username);
            return Ok(new { message = "Todas as notificações de seguimento foram marcadas como lidas." });
        }

        /// <summary>
        /// Marca todas as notificações de resposta como lidas para um determinado utilizador.
        /// </summary>
        /// <param name="username">Nome do utilizador.</param>
        /// <returns>Mensagem indicando o sucesso da operação.</returns>
        [HttpPost("replyNotifications/mark-all-as-read/{username}")]
        public async Task<IActionResult> MarkAllReplyNotificationsAsRead(string username)
        {
            await _notificationService.MarkAllReplyNotificationsAsReadAsync(username);
            return Ok(new { message = "Todas as notificações de resposta foram marcadas como lidas." });
        }

        /// <summary>
        /// Limpa todas as notificações de um determinado utilizador.
        /// </summary>
        /// <param name="username">Nome do utilizador.</param>
        /// <returns>Mensagem indicando o sucesso da operação.</returns>
        [HttpDelete("clearNotifications/{username}")]
        public async Task<IActionResult> ClearNotifications(string username)
        {
            await _notificationService.ClearNotificationsForUserAsync(username);
            return Ok(new { message = "Notificações limpas com sucesso." });
        }

        /// <summary>
        /// Verifica se existem notificações não lidas para um determinado utilizador.
        /// </summary>
        /// <param name="username">Nome do utilizador.</param>
        /// <returns>Objeto indicando a presença de notificações não lidas.</returns>
        [HttpGet("hasUnread/{username}")]
        public async Task<IActionResult> HasUnreadNotifications(string username)
        {
            bool hasUnread = await _notificationService.HasUnreadNotificationsAsync(username);
            return Ok(new { HasUnread = hasUnread });
        }

        /// <summary>
        /// Obtém as notificações de conquistas para o utilizador autenticado.
        /// </summary>
        /// <param name="authenticatedUsername">Nome do utilizador autenticado.</param>
        /// <returns>Lista de notificações de conquistas.</returns>
        [HttpGet("achievementNotifications/{authenticatedUsername}")]
        public async Task<IActionResult> GetMyAchievementNotifications(string authenticatedUsername)
        {
            var userAuthenticated = await _userManager.FindByNameAsync(authenticatedUsername);
            if (userAuthenticated == null)
            {
                return NotFound(new { message = $"utilizador autenticado '{authenticatedUsername}' não encontrado." });
            }

            var userIdAuthenticated = userAuthenticated.Id;
            var notifications = await _notificationService.GetAchievementNotificationsForUserAsync(userIdAuthenticated);

            return Ok(notifications);
        }

        /// <summary>
        /// Obtém as notificações de mensagens para o utilizador autenticado.
        /// </summary>
        /// <param name="authenticatedUsername">Nome do utilizador autenticado.</param>
        /// <returns>Lista de notificações de mensagens.</returns>
        [HttpGet("messageNotifications/{authenticatedUsername}")]
        public async Task<IActionResult> GetMyMessageNotifications(string authenticatedUsername)
        {
            var userAuthenticated = await _userManager.FindByNameAsync(authenticatedUsername);
            if (userAuthenticated == null)
            {
                return NotFound(new { message = $"utilizador autenticado '{authenticatedUsername}' não encontrado." });
            }

            var userIdAuthenticated = userAuthenticated.Id;
            var notifications = await _notificationService.GetMessageNotificationsForUserAsync(userIdAuthenticated);

            return Ok(notifications);
        }

        /// <summary>
        /// Marca todas as notificações de conquistas como lidas para um determinado utilizador.
        /// </summary>
        /// <param name="username">Nome do utilizador.</param>
        /// <returns>Mensagem de sucesso.</returns>
        [HttpPost("achievementNotifications/mark-all-as-read/{username}")]
        public async Task<IActionResult> MarkAllAchievementNotificationsAsRead(string username)
        {
            await _notificationService.MarkAllAchievementNotificationsAsReadAsync(username);
            return Ok(new { message = "All achievement notifications have been marked as read." });
        }

        /// <summary>
        /// Marca todas as notificações de mensagens como lidas para um determinado utilizador.
        /// </summary>
        /// <param name="username">Nome do utilizador.</param>
        /// <returns>Mensagem de sucesso.</returns>
        [HttpPost("messageNotifications/mark-all-as-read/{username}")]
        public async Task<IActionResult> MarkAllMessageNotificationsAsRead(string username)
        {
            await _notificationService.MarkAllMessageNotificationsAsReadAsync(username);
            return Ok(new { message = "All message notifications have been marked as read." });
        }

        /// <summary>
        /// Notifica os utilizadores sobre um novo episódio ou mídia, baseado nas preferências dos utilizadores.
        /// </summary>
        /// <param name="notificationDto">Dados da notificação a ser enviada.</param>
        /// <returns>Confirmação de sucesso ou erro.</returns>
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

        /// <summary>
        /// Obtém as notificações de novas mídias ou episódios para o utilizador autenticado,
        /// possivelmente filtradas por nome e foto da mídia.
        /// </summary>
        /// <param name="authenticatedUsername">Nome do utilizador autenticado.</param>
        /// <param name="mediaName">Nome da série ou mídia (opcional).</param>
        /// <param name="mediaPhoto">Foto da mídia (opcional).</param>
        /// <returns>Lista de notificações de novas mídias ou episódios.</returns>
        [HttpGet("mediaNotifications/{authenticatedUsername}")]
        public async Task<IActionResult> GetMyMediaNotifications(string authenticatedUsername, [FromQuery] string mediaName, [FromQuery] string mediaPhoto)
        {
            var userAuthenticated = await _userManager.FindByNameAsync(authenticatedUsername);
            if (userAuthenticated == null)
            {
                return NotFound(new { message = $"utilizador autenticado '{authenticatedUsername}' não encontrado." });
            }

            var userIdAuthenticated = userAuthenticated.Id;
            var notifications = await _notificationService.GetMediaNotificationsForUserAsync(userIdAuthenticated, mediaName, mediaPhoto);

            return Ok(notifications);
        }

        /// <summary>
        /// Marca todas as notificações de novas mídias ou episódios como lidas para um determinado utilizador.
        /// </summary>
        /// <param name="username">Nome do utilizador.</param>
        /// <returns>Mensagem de sucesso.</returns>
        [HttpPost("mediaNotifications/mark-all-as-read/{username}")]
        public async Task<IActionResult> MarkAllMediaNotificationsAsRead(string username)
        {
            await _notificationService.MarkAllMediaNotificationsAsReadAsync(username);
            return Ok(new { message = "Todas as notificações de media foram marcadas como lidas." });
        }
    }
}
