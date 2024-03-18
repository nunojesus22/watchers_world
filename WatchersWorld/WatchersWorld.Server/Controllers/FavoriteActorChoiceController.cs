using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Identity;
using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;
using WatchersWorld.Server.Data;
using WatchersWorld.Server.DTOs;
using WatchersWorld.Server.Models.Authentication;
using WatchersWorld.Server.Models.Media.FavoriteActor;
using WatchersWorld.Server.Services;

namespace WatchersWorld.Server.Controllers
{
    [Route("api/[controller]")]
    [ApiController]
    public class FavoriteActorChoiceController : ControllerBase
    {
        private readonly WatchersWorldServerContext _context;
        private readonly UserManager<User> _userManager;
        private readonly ILogger<FavoriteActorChoiceController> _logger;
        private readonly IFavoriteActorService _favoriteActorService;

        public FavoriteActorChoiceController(WatchersWorldServerContext context, UserManager<User> userManager, ILogger<FavoriteActorChoiceController> logger, IFavoriteActorService favoriteActorService)
        {
            _context = context;
            _userManager = userManager;
            _logger = logger;
            _favoriteActorService = favoriteActorService;
        }

        [HttpPost("choose-an-actor")]
        public async Task<IActionResult> ChooseAnActor([FromBody] FavoriteActorChoiceDto favoriteActorChoice)
        {
            var userAuthenticated = await _userManager.FindByNameAsync(favoriteActorChoice.Username);
            if (userAuthenticated == null) return BadRequest("User não reconhecido no sistema!");

            var result = await _favoriteActorService.ChooseAnActor(userAuthenticated.Id, favoriteActorChoice.ActorChoiceId, favoriteActorChoice.Media, favoriteActorChoice.MediaCast);
            switch (result)
            {
                case false:
                    return BadRequest("Não foi possível selecionar o ator favorito.");
                case true:
                    var choicesPercentage = await _favoriteActorService.GetChoicesForMedia(favoriteActorChoice.Media.MediaId);
                    return Ok(choicesPercentage);
            }
        }

        [HttpGet("get-choices/{mediaId}")]
        public async Task<IActionResult> GetChoicesForMedia(int mediaId)
        {
            var choicesPercentage = await _favoriteActorService.GetChoicesForMedia(mediaId);
            return Ok(choicesPercentage);
        }

        [HttpGet("get-user-choice/{username}/{mediaId}")]
        public async Task<IActionResult> GetChoicesForMedia(string username, int mediaId)
        {
            var userAuthenticated = await _userManager.FindByNameAsync(username);
            if (userAuthenticated == null) return BadRequest("User não reconhecido no sistema!");

            var result = await _favoriteActorService.GetUserChoice(userAuthenticated.Id, mediaId);
            if(result != 0)
            {
                return Ok(result);
            }

            return BadRequest("Não foi possível obter o voto do user no ator favorito dessa media.");
        }

    }
}
