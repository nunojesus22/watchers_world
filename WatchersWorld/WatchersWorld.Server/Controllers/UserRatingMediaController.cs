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
                    var choicesPercentage = await _ratingMediaService.GetRatesForMedia(ratingMediaDto.Media.MediaId);
                    return Ok(choicesPercentage);
            }
        }

        /// <summary>
        /// Obtém as avaliações de uma media específica.
        /// </summary>
        /// <param name="mediaId">Identificador da media.</param>
        /// <returns>Percentagens de avaliação da media.</returns>
        [HttpGet("get-rates/{mediaId}")]
        public async Task<IActionResult> GetChoicesForMedia(int mediaId)
        {
            var choicesPercentage = await _ratingMediaService.GetRatesForMedia(mediaId);
            return Ok(choicesPercentage);
        }

        /// <summary>
        /// Obtém a avaliação de um utilizador para uma media específica.
        /// </summary>
        /// <param name="username">Nome do utilizador.</param>
        /// <param name="mediaId">Identificador da media.</param>
        /// <returns>Avaliação do utilizador para a media, se existir.</returns>
        [HttpGet("get-user-choice/{username}/{mediaId}")]
        public async Task<IActionResult> GetUserChoicesForMedia(string username, int mediaId)
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

        /// <summary>
        /// Obtém a avaliação média de uma media específica.
        /// </summary>
        /// <param name="mediaId">Identificador da media.</param>
        /// <returns>Avaliação média da media.</returns>
        [HttpGet("get-average-rating/{mediaId}")]
        public async Task<IActionResult> GetAverageRatingForMedia(int mediaId)
        {
            var averageRating = await _ratingMediaService.GetAverageRatingForMedia(mediaId);
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
