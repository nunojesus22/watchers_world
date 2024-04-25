using Microsoft.AspNetCore.Identity;
using Microsoft.AspNetCore.Mvc;
using WatchersWorld.Server.Data;
using WatchersWorld.Server.DTOs;
using WatchersWorld.Server.DTOs.Media;
using WatchersWorld.Server.Models.Authentication;
using WatchersWorld.Server.Services;

namespace WatchersWorld.Server.Controllers
{
    /// <summary>
    /// Controlador para a gestão de avaliações de media por parte dos utilizadores.
    /// Permite atribuir avaliações a media, obter avaliações e a avaliação média de uma media específica.
    /// </summary>
    /// <remarks>
    /// Construtor para o controlador UserRatingMediaController.
    /// Inicializa as instâncias necessárias para a gestão de avaliações de media por parte dos utilizadores.
    /// </remarks>
    /// <param name="userManager">Fornece a API para gestão de utilizadores no sistema de identidade.</param>
    /// <param name="ratingMediaService">Serviço responsável pela lógica de negócio relacionada com avaliações de media.</param>
    [Route("api/[controller]")]
    [ApiController]
    public class UserRatingMediaController(UserManager<User> userManager, IRatingMediaService ratingMediaService) : ControllerBase
    {
        private readonly UserManager<User> _userManager = userManager;
        private readonly IRatingMediaService _ratingMediaService = ratingMediaService;

        /// <summary>
        /// Atribui uma avaliação de um utilizador a uma media específica.
        /// </summary>
        /// <param name="ratingMediaDto">Dados da avaliação, incluindo a media e a avaliação.</param>
        /// <returns>Resultado da operação, incluindo as percentagens de avaliação atualizadas da media, se bem-sucedido.</returns>
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
                    var choicesPercentage = await _ratingMediaService.GetRatesForMedia(ratingMediaDto.Media.MediaId, ratingMediaDto.Media.Type);
                    return Ok(choicesPercentage);
            }
        }

        /// <summary>
        /// Obtém as avaliações de uma mídia específica.
        /// </summary>
        /// <param name="mediaId">Identificador da mídia.</param>
        /// <param name="type">Tipo da mídia.</param>
        /// <returns>Percentagens de avaliação da mídia.</returns>
        [HttpGet("get-rates")]
        public async Task<IActionResult> GetChoicesForMedia([FromQuery] string mediaId, [FromQuery] string type)
        {
            var choicesPercentage = await _ratingMediaService.GetRatesForMedia(int.Parse(mediaId), type);
            return Ok(choicesPercentage);
        }


        /// <summary>
        /// Obtém a avaliação de um utilizador para uma media específica.
        /// </summary>
        /// <param name="username">Nome do utilizador.</param>
        /// <param name="mediaId">Identificador da media.</param>
        /// <param name="type">Tipo da media.</param>
        /// <returns>Avaliação do utilizador para a media, se existir.</returns>
        [HttpGet("get-user-choice/{username}")]
        public async Task<IActionResult> GetUserChoicesForMedia(string username, [FromQuery] string mediaId, [FromQuery] string type)
        {
            var userAuthenticated = await _userManager.FindByNameAsync(username);
            if (userAuthenticated == null) return BadRequest("User não reconhecido no sistema!");

            var result = await _ratingMediaService.GetUserRate(userAuthenticated.Id, int.Parse(mediaId), type);
            if (result != 0)
            {
                return Ok(result);
            }

            return BadRequest("Não foi possível obter o voto do user no ator favorito dessa media.");
        }

        /// <summary>
        /// Obtém a avaliação média de uma media específica.
        /// </summary>
        /// <param name="mediaId">Identificador da media.</param>
        /// <param name="type">Tipo da media.</param>
        /// <returns>Avaliação média da media.</returns>
        [HttpGet("get-average-rating")]
        public async Task<IActionResult> GetAverageRatingForMedia([FromQuery] string mediaId, [FromQuery] string type)
        {
            var averageRating = await _ratingMediaService.GetAverageRatingForMedia(int.Parse(mediaId), type);
            return Ok(averageRating);
        }


        [HttpGet("get-rating-by-user")]
        public async Task<IActionResult> GetTotalFavoriteActors()
        {
            var userAuthenticated = await _userManager.GetUserAsync(User);
            if (userAuthenticated == null) return BadRequest("Utilizador não encontrado.");

            var totalFavoriteActors = await _ratingMediaService.GetTotalRatinsByUser(userAuthenticated.Id);

            return Ok(totalFavoriteActors);
        }
    }
}
