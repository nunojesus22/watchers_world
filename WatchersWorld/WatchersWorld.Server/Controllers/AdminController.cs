using Microsoft.AspNetCore.Identity;
using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;
using Google.Apis.Auth;
using Mailjet.Client.TransactionalEmails;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.WebUtilities;
using NuGet.Versioning;
using System.Security.Claims;
using System.Text;
using WatchersWorld.Server.Data;
using WatchersWorld.Server.DTOs.Account;
using WatchersWorld.Server.Models.Authentication;
using WatchersWorld.Server.Services;

namespace WatchersWorld.Server.Controllers
{

    /// <summary>
    /// Controlador para operações administrativas, incluindo gestão de utilizadores e obtenção de estatísticas.
    /// </summary>
    [Microsoft.AspNetCore.Components.Route("api/[controller]")]
    [ApiController]
    public class AdminController : ControllerBase
    {

        private readonly UserManager<User> _userManager;
        private readonly EmailService _emailService;
        private readonly IAdminService _adminService;

        private readonly ILogger<AccountController> _logger;


        private WatchersWorldServerContext _context;

        public AdminController(UserManager<User> userManager, EmailService emailService, WatchersWorldServerContext context, ILogger<AccountController> logger, IAdminService adminService)
        {
            _userManager = userManager;
            _emailService = emailService;
            _context = context;
            _logger = logger;
            _adminService = adminService;
        }


        /// <summary>
        /// Obtém as roles de um utilizador específico.
        /// </summary>
        /// <param name="username">Nome do utilizador.</param>
        /// <returns>Um array com as roles do utilizador.</returns>
        [HttpGet("api/admin/getUserRole/{username}")]
        public async Task<ActionResult<string[]>> GetUserRole(string username)
        {
            try
            {
                var roles = await _adminService.GetUserRoleAsync(username);
                return Ok(roles);
            }
            catch (KeyNotFoundException ex)
            {
                return NotFound(ex.Message);
            }
        }


        /// <summary>
        /// Aplica um banimento permanente a um utilizador.
        /// </summary>
        /// <param name="username">Nome do utilizador.</param>
        /// <returns>Mensagem de sucesso ou erro.</returns>
        [HttpPost("api/admin/ban-user-permanently/{username}")]
        //[Authorize(Roles = "Admin")] // Ensure only admins can perform this action
        public async Task<IActionResult> BanUserPermanently(string username)
        {
            var message = await _adminService.BanUserPermanentlyAsync(username);
            if (message == "User not found." || message == "User profile info not found.")
            {
                return NotFound(message);
            }
            return Ok(new { message });
        }


        /// <summary>
        /// Aplica um banimento temporário a um utilizador.
        /// </summary>
        /// <param name="username">Nome do utilizador.</param>
        /// <param name="banDurationInDays">Duração do banimento em dias.</param>
        /// <returns>Mensagem de sucesso ou erro.</returns>
        [HttpPost("api/admin/ban-user-temporarily/{username}")]
        //[Authorize(Roles = "Admin")] // Ensure only admins can perform this action
        public async Task<IActionResult> BanUserTemporarily(string username, [FromQuery] int banDurationInDays)
        {
            var result = await _adminService.BanUserTemporarilyAsync(username, banDurationInDays);
            if (result.Contains("not found"))
            {
                return NotFound(result);
            }
            return Ok(new { message = result });
        }


        /// <summary>
        /// Elimina um utilizador pelo nome de utilizador.
        /// </summary>
        /// <param name="username">Nome do utilizador.</param>
        /// <returns>Mensagem de sucesso ou erro.</returns>
        [HttpDelete("api/admin/users/{username}")]
        //[Authorize(Roles = "Admin")] // Ensuring that only authorized users can perform this action
        public async Task<IActionResult> DeleteUserByUsername(string username)
        {
            var result = await _adminService.DeleteUserByUsernameAsync(username);
            if (result.Contains("not found"))
            {
                return NotFound(result);
            }
            else if (result.Contains("Error"))
            {
                return BadRequest(result);
            }
            return Ok(new { message = result });
        }


        /// <summary>
        /// Remove o ban de um utilizador.
        /// </summary>
        /// <param name="username">Nome do utilizador.</param>
        /// <returns>Mensagem de sucesso ou erro.</returns>
        [HttpPut("api/admin/unban-user/{username}")]
        //[Authorize(Roles = "Admin")] // Ensure only admins can perform this action
        public async Task<IActionResult> UnbanUser(string username)
        {
            var result = await _adminService.UnbanUserAsync(username);
            if (result == "User not found." || result == "User profile info not found.")
            {
                return NotFound(result);
            }
            return Ok(new { message = result });

        }


        /// <summary>
        /// Altera a role de um utilizador para moderator.
        /// </summary>
        /// <param name="username">Nome do utilizador.</param>
        /// <returns>Mensagem de sucesso ou erro.</returns>
        [HttpPut("api/admin/change-role-to-moderator/{username}")]
        public async Task<IActionResult> ChangeRoleToModerator(string username)
        {
            var result = await _adminService.ChangeRoleToModeratorAsync(username);
            if (result == "User not found.")
            {
                return NotFound(result);
            }
            else if (result.Contains("Failed"))
            {
                return BadRequest(result);
            }
            return Ok(new { message = result });
        }


        /// <summary>
        /// Altera a role de um utilizador de moderator para user.
        /// </summary>
        /// <param name="username">Nome do utilizador.</param>
        /// <returns>Mensagem de sucesso ou erro.</returns>
        [HttpPut("api/admin/change-role-to-user/{username}")]
        public async Task<IActionResult> ChangeRoleToUser(string username)
        {
            var result = await _adminService.ChangeRoleToUserAsync(username);
            if (result == "User not found.")
            {
                return NotFound(result);
            }
            else if (result.Contains("Failed"))
            {
                return BadRequest(result);
            }
            return Ok(new { message = result });
        }

        /// <summary>
        /// Obtém o número total de utilizadores banidos no sistema.
        /// </summary>
        /// <returns>Um número inteiro representando o total de utilizadores banidos.</returns>
        /// <response code="200">Retorna o total de utilizadores banidos.</response>
        [HttpGet("api/admin/total-banned-users")]
        public async Task<ActionResult<int>> GetTotalBannedUsers()
        {
            int totalBannedUsers = await _context.ProfileInfo.CountAsync(p => p.StartBanDate != null);
            return Ok(totalBannedUsers);
        }

        /// <summary>
        /// Obtém o número total de utilizadores registrados no sistema.
        /// </summary>
        /// <returns>Um número inteiro representando o total de utilizadores registrados.</returns>
        /// <response code="200">Retorna o total de utilizadores registrados.</response>
        [HttpGet("api/admin/total-registered-users")]
        public async Task<ActionResult<int>> GetTotalRegisteredUsers()
        {
            var totalUsers = await _userManager.Users.CountAsync();
            return Ok(totalUsers);
        }

        /// <summary>
        /// Obtém o número total de perfis privados no sistema.
        /// </summary>
        /// <returns>Um número inteiro representando o total de perfis privados.</returns>
        /// <response code="200">Retorna o total de perfis privados.</response>
        [HttpGet("api/admin/total-private-profiles")]
        public async Task<ActionResult<int>> GetTotalPrivateProfiles()
        {
            int totalPrivateProfiles = await _context.ProfileInfo.CountAsync(p => p.ProfileStatus == "Private");
            return Ok(totalPrivateProfiles);
        }

        /// <summary>
        /// Obtém o número total de perfis públicos no sistema.
        /// </summary>
        /// <returns>Um número inteiro representando o total de perfis públicos.</returns>
        /// <response code="200">Retorna o total de perfis públicos.</response>
        [HttpGet("api/admin/total-public-profiles")]
        public async Task<ActionResult<int>> GetTotalPublicProfiles()
        {
            int totalPublicProfiles = await _context.ProfileInfo.CountAsync(p => p.ProfileStatus == "Public");
            return Ok(totalPublicProfiles);
        }

        /// <summary>
        /// Obtém o número total de comentários feitos em todo o sistema.
        /// </summary>
        /// <returns>Um número inteiro representando o total de comentários.</returns>
        /// <response code="200">Retorna o total de comentários.</response>
        [HttpGet("api/admin/total-comments")]
        public async Task<ActionResult<int>> GetTotalComments()
        {
            int totalComments = await _context.Comments.CountAsync();
            return Ok(totalComments);
        }

    }
}