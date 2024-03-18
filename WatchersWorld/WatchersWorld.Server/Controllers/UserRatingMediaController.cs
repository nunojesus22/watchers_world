using Microsoft.AspNetCore.Identity;
using Microsoft.AspNetCore.Mvc;
using WatchersWorld.Server.Data;
using WatchersWorld.Server.DTOs;
using WatchersWorld.Server.DTOs.Media;
using WatchersWorld.Server.Models.Authentication;
using WatchersWorld.Server.Services;

namespace WatchersWorld.Server.Controllers
{
    [Route("api/[controller]")]
    [ApiController]
    public class UserRatingMediaController : ControllerBase
    {
        private readonly WatchersWorldServerContext _context;
        private readonly UserManager<User> _userManager;
        private readonly ILogger<UserRatingMediaController> _logger;
        private readonly IRatingMediaService _ratingMediaService;

        public UserRatingMediaController(WatchersWorldServerContext context, UserManager<User> userManager, ILogger<UserRatingMediaController> logger, IRatingMediaService ratingMediaService)
        {
            _context = context;
            _userManager = userManager;
            _logger = logger;
            _ratingMediaService = ratingMediaService;
        }

        [HttpPost("give-rating")]
        public async Task<IActionResult> GiveRatingToMedia([FromBody] RatingMediaDto ratingMediaDto)
        {
            var userAuthenticated = await _userManager.FindByNameAsync(ratingMediaDto.Username);
            if (userAuthenticated == null) return BadRequest("User não reconhecido no sistema!");

            var result = await _ratingMediaService.GiveRatingToMedia(userAuthenticated.Id, ratingMediaDto.Media, ratingMediaDto.Rating);
            switch (result)
            {
                case false:
                    return BadRequest("Não foi possível selecionar o ator favorito.");
                case true:
                    var choicesPercentage = await _ratingMediaService.GetRatesForMedia(ratingMediaDto.Media.MediaId);
                    return Ok(choicesPercentage);
            }
        }

        [HttpGet("get-rates/{mediaId}")]
        public async Task<IActionResult> GetChoicesForMedia(int mediaId)
        {
            var choicesPercentage = await _ratingMediaService.GetRatesForMedia(mediaId);
            return Ok(choicesPercentage);
        }

        [HttpGet("get-user-choice/{username}/{mediaId}")]
        public async Task<IActionResult> GetChoicesForMedia(string username, int mediaId)
        {
            var userAuthenticated = await _userManager.FindByNameAsync(username);
            if (userAuthenticated == null) return BadRequest("User não reconhecido no sistema!");

            var result = await _ratingMediaService.GetUserRate(userAuthenticated.Id, mediaId);
            if (result != 0)
            {
                return Ok(result);
            }

            return BadRequest("Não foi possível obter o voto do user no ator favorito dessa media.");
        }

        [HttpGet("get-average-rating/{mediaId}")]
        public async Task<IActionResult> GetAverageRatingForMedia(int mediaId)
        {
            var averageRating = await _ratingMediaService.GetAverageRatingForMedia(mediaId);
            return Ok(averageRating);
        }
    }
}
