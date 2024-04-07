using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;
using WatchersWorld.Server.Data;
using WatchersWorld.Server.DTOs.Gamification;
using WatchersWorld.Server.Models.Gamification;
using WatchersWorld.Server.Services;

namespace WatchersWorld.Server.Controllers
{
    [Authorize]
    [Route("api/[controller]")]
    [ApiController]
    public class GamificationController : Controller
    {
        private readonly WatchersWorldServerContext _context;
        private readonly GamificationService _gamificationService;


        public GamificationController(WatchersWorldServerContext context, GamificationService gamificationService)
        {
            _context = context;
            _gamificationService = gamificationService;

        }

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


        public class AwardMedalRequest
        {
            public string UserName { get; set; }
            public string MedalName { get; set; }
        }

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
