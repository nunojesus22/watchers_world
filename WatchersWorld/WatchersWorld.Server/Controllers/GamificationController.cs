using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;
using WatchersWorld.Server.Data;
using WatchersWorld.Server.Models.Gamification;
using WatchersWorld.Server.Services;

namespace WatchersWorld.Server.Controllers
{
    [Microsoft.AspNetCore.Components.Route("api/[controller]")]
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
    }
}
