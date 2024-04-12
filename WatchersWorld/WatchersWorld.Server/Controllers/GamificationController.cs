using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;
using System;
using WatchersWorld.Server.Data;
using WatchersWorld.Server.DTOs.Gamification;
using WatchersWorld.Server.Models.Gamification;
using WatchersWorld.Server.Services;

namespace WatchersWorld.Server.Controllers
{

    /// <summary>
    /// Controlador para gerir operações de gamificação, incluindo a atribuição de medalhas e consulta de medalhas desbloqueadas ou bloqueadas para os utilizadores.
    /// </summary>
    [Authorize]
    [Route("api/[controller]")]
    [ApiController]
    public class GamificationController : Controller
    {
        private readonly WatchersWorldServerContext _context;
        private readonly IGamificationService _gamificationService;

        /// <summary>
        /// Inicializa uma nova instância do <see cref="GamificationController"/> com os serviços necessários para gerir as operações de gamificação.
        /// </summary>
        /// <param name="context">O contexto do banco de dados utilizado para operações de dados diretamente relacionadas às medalhas e usuários.</param>
        /// <param name="gamificationService">O serviço que fornece métodos específicos de gamificação, como atribuição e consulta de medalhas.</param>

        public GamificationController(WatchersWorldServerContext context, IGamificationService gamificationService)
        {
            _context = context;
            _gamificationService = gamificationService;

        }


        /// <summary>
        /// Atribui uma medalha a um utilizador especificado.
        /// </summary>
        /// <param name="request">Dados da requisição contendo o nome do utilizador e o nome da medalha.</param>
        /// <returns>Resultado da operação de atribuição.</returns>
        [HttpPost("AwardMedal")]
        public async Task<IActionResult> AwardMedal([FromBody] AwardMedalRequest request)
        {
            bool success = await _gamificationService.AwardMedalAsync(request.UserName, request.MedalName);

            if (!success)
            {
                return BadRequest("Failed to award medal.");
            }

            return Ok();
        }

        /// <summary>
        /// Modelo de dados para a requisição de atribuição de medalhas.
        /// </summary>
        public class AwardMedalRequest
        {
            public string UserName { get; set; }
            public string MedalName { get; set; }
        }

        /// <summary>
        /// Obtém as medalhas desbloqueadas por um utilizador específico.
        /// </summary>
        /// <param name="userName">Nome do utilizador.</param>
        /// <returns>Uma lista de medalhas desbloqueadas.</returns>
        [HttpGet("unlocked-medals/{userName}")]
        public async Task<ActionResult<List<MedalsDto>>> GetUnlockedMedals(string userName)
        {
            if (string.IsNullOrWhiteSpace(userName))
            {
                return BadRequest("User ID must be provided.");
            }

            var medals = await _gamificationService.GetUnlockedMedalsAsync(userName);
            return Ok(medals);
        }


        /// <summary>
        /// Obtém todas as medalhas disponíveis no sistema.
        /// </summary>
        /// <returns>Uma lista de todas as medalhas.</returns>
        [HttpGet("available-medals")]
        public async Task<IActionResult> GetAvailableMedals()
        {
            var medals = await _context.Medals
                .Select(m => new MedalsDto
                {
                    Id = m.Id,
                    Name = m.Name,
                    Description = m.Description,
                    Image = m.Image
                })
                .ToListAsync();

            return Ok(medals);
        }


        /// <summary>
        /// Obtém as medalhas que um utilizador específico ainda não desbloqueou.
        /// </summary>
        /// <param name="userName">Nome do utilizador.</param>
        /// <returns>Uma lista de medalhas bloqueadas.</returns>
        [HttpGet("locked-medals/{userName}")]
        public async Task<ActionResult<List<MedalsDto>>> GetLockedMedals(string userName)
        {
            if (string.IsNullOrWhiteSpace(userName))
            {
                return BadRequest("User name must be provided.");
            }

            var lockedMedals = await _gamificationService.GetLockedMedalsAsync(userName);
            return Ok(lockedMedals);
        }


        /// <summary>
        /// Obtém o total de medalhas atribuídas a um utilizador específico.
        /// </summary>
        /// <param name="username">Nome do utilizador.</param>
        /// <returns>O número total de medalhas atribuídas ao utilizador.</returns>
        [HttpGet("/api/gamification/medals/{username}")]
        public async Task<ActionResult<int>> GetTotalMedals(string username)
        {
            var user = await _context.Users.FirstOrDefaultAsync(u => u.UserName == username);
            if (user == null)
            {
                return NotFound("User not found.");
            }
            var totalAttempts = await _context.UserMedals
                .CountAsync(a => a.UserName== user.UserName);

            return Ok(totalAttempts);
        }

    }
}
