using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Identity;
using Microsoft.AspNetCore.Mvc;
using WatchersWorld.Server.Data;
using WatchersWorld.Server.DTOs;
using WatchersWorld.Server.Models.Authentication;
using WatchersWorld.Server.Models.Media.FavoriteActor;
using WatchersWorld.Server.Services;

namespace WatchersWorld.Server.Controllers
{
    /// <summary>
    /// Controlador para gerir as escolhas de atores favoritos dos utilizadores.
    /// Permite aos utilizadores escolherem o seu ator favorito para uma determinada media, obter as escolhas para uma media e a escolha específica de um utilizador.
    /// </summary>
    /// <remarks>
    /// Construtor que inicializa o controlador com as dependências necessárias.
    /// </remarks>
    /// <param name="userManager">Gestor de utilizadores para operações relacionadas com utilizadores.</param>
    /// <param name="favoriteActorService">Serviço para operações relacionadas com atores favoritos.</param>
    [Route("api/[controller]")]
    [ApiController]
    public class FavoriteActorChoiceController(UserManager<User> userManager, IFavoriteActorService favoriteActorService) : ControllerBase
    {
        private readonly UserManager<User> _userManager = userManager;
        private readonly IFavoriteActorService _favoriteActorService = favoriteActorService;

        /// <summary>
        /// Permite a um utilizador escolher um ator favorito para uma media específica.
        /// </summary>
        /// <param name="favoriteActorChoice">Dados da escolha do ator favorito.</param>
        /// <returns>Resultado da operação, incluindo as percentagens de escolhas atualizadas, se bem-sucedido.</returns>
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

        /// <summary>
        /// Obtém as percentagens de escolha de atores favoritos para uma media específica.
        /// </summary>
        /// <param name="mediaId">Identificador da media.</param>
        /// <returns>Percentagens de escolhas para a media.</returns>
        [HttpGet("get-choices/{mediaId}")]
        public async Task<IActionResult> GetChoicesForMedia(int mediaId)
        {
            var choicesPercentage = await _favoriteActorService.GetChoicesForMedia(mediaId);
            return Ok(choicesPercentage);
        }

        /// <summary>
        /// Obtém a escolha de ator favorito de um utilizador para uma media específica.
        /// </summary>
        /// <param name="username">Nome de utilizador.</param>
        /// <param name="mediaId">Identificador da media.</param>
        /// <returns>Escolha do utilizador, se existir.</returns>
        [HttpGet("get-user-choice/{username}/{mediaId}")]
        public async Task<IActionResult> GetUserChoiceGeForMedia(string username, int mediaId)
        {
            var userAuthenticated = await _userManager.FindByNameAsync(username);
            if (userAuthenticated == null) return BadRequest("User não reconhecido no sistema!");

            var result = await _favoriteActorService.GetUserChoice(userAuthenticated.Id, mediaId);
            if (result != 0)
            {
                return Ok(result);
            }

            // Altere de BadRequest para Ok e retorne null ou um identificador claro que possa ser tratado pelo frontend
            return Ok(new { ChoiceId = (int?)null });
        }
        [HttpGet("get-total-favorite-actors")]
        public async Task<IActionResult> GetTotalFavoriteActors()
        {
            var userAuthenticated = await _userManager.GetUserAsync(User);
            if (userAuthenticated == null) return BadRequest("Utilizador não encontrado.");

            var totalFavoriteActors = await _favoriteActorService.GetTotalFavoriteActorsByUser(userAuthenticated.Id);

            return Ok(totalFavoriteActors);
        }
    }
}
