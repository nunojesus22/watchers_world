using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;
using System.Security.Claims;
using WatchersWorld.Server.Data;
using WatchersWorld.Server.DTOs.Media;
using WatchersWorld.Server.Models.Media;

namespace WatchersWorld.Server.Controllers
{
    /// <summary>
    /// Controlador responsável pela gestão de medias no contexto da aplicação, incluindo operações como marcar medias como assistidas ou para assistir mais tarde,
    /// verificar se uma media foi assistida ou está marcada para assistir mais tarde, e obter listas de medias assistidas ou para assistir mais tarde de um utilizador específico.
    /// </summary>
    /// <remarks>
    /// Inicializa uma nova instância do controlador MediaController com o contexto fornecido.
    /// </remarks>
    /// <param name="context">O contexto do servidor WatchersWorld para acesso à base de dados.</param>
    [Authorize]
    [Route("api/[controller]")]
    [ApiController]
    public class MediaController(WatchersWorldServerContext context) : Controller
    {
        private readonly WatchersWorldServerContext _context = context;

        /// <summary>
        /// Marca uma media como assistida por um utilizador.
        /// </summary>
        /// <param name="request">Dados da media a ser marcada como assistida.</param>
        /// <returns>Um resultado indicando se a operação foi bem-sucedida.</returns>
        [Authorize]
        [HttpPost("/api/media/mark-watched")]
        public IActionResult MarkAsWatched([FromBody] UserMediaDto request)
        {
            var userId = User.FindFirst(ClaimTypes.NameIdentifier)?.Value;
            if (userId == null) return Unauthorized();

            var mediaInfo = _context.MediaInfoModel.FirstOrDefault(mi => mi.IdMedia == request.MediaId && mi.Type == request.Type);
            if (mediaInfo == null)
            {
                mediaInfo = new MediaInfoModel { IdMedia = request.MediaId, Type = request.Type };
                _context.MediaInfoModel.Add(mediaInfo);
                _context.SaveChanges();
            }

            // Remove from 'watch later' list if exists
            var existingWatchLaterEntry = _context.UserMedia.FirstOrDefault(um => um.UserId == userId && um.IdTableMedia == mediaInfo.IdTableMedia && (um.IdListMedia == 3 || um.IdListMedia == 4));
            if (existingWatchLaterEntry != null) _context.UserMedia.Remove(existingWatchLaterEntry);

            // Add to 'watched' list or update existing entry
            var userMedia = _context.UserMedia.FirstOrDefault(um => um.UserId == userId && um.IdTableMedia == mediaInfo.IdTableMedia);
            if (userMedia == null)
            {
                userMedia = new UserMedia { UserId = userId, IdTableMedia = mediaInfo.IdTableMedia, IdListMedia = request.Type == "movie" ? 1 : 2 };
                _context.UserMedia.Add(userMedia);
            }
            else
            {
                userMedia.IdListMedia = request.Type == "movie" ? 1 : 2; // Update if already exists
            }
            _context.SaveChanges();
            bool isToWatchLater = false;

            return Ok(new { isWatched = true, isToWatchLater });
        }

        /// <summary>
        /// Verifica se uma media específica foi marcada como assistida por um utilizador.
        /// </summary>
        /// <param name="mediaId">Identificador da media.</param>
        /// <param name="mediaType">Tipo da media (ex: filme ou série).</param>
        /// <returns>Um resultado indicando se a media foi marcada como assistida.</returns>
        [Authorize]
        [HttpGet("/api/media/is-watched/{mediaId}/{mediaType}")]
        public IActionResult IsMediaWatched(int mediaId, string mediaType)
        {
            var userId = User.FindFirst(ClaimTypes.NameIdentifier)?.Value;
            if (userId == null)
            {
                return Unauthorized(); // Se não houver usuário logado, retorne um erro
            }

            var isWatched = _context.UserMedia
                .Any(um => um.UserId == userId && um.MediaInfoModel.IdMedia == mediaId && um.MediaInfoModel.Type == mediaType && um.IdListMedia == (mediaType == "movie" ? 1 : 2));

            return Ok(new { isWatched });
        }

        /// <summary>
        /// Verifica se uma media específica foi marcada para assistir mais tarde por um utilizador.
        /// </summary>
        /// <param name="mediaId">Identificador da media.</param>
        /// <param name="mediaType">Tipo da media (ex: filme ou série).</param>
        /// <returns>Um resultado indicando se a media foi marcada para assistir mais tarde.</returns>
        [Authorize]
        [HttpGet("/api/media/is-watched-later/{mediaId}/{mediaType}")]
        public IActionResult IsMediaWatchedLater(int mediaId, string mediaType)
        {
            var userId = User.FindFirst(ClaimTypes.NameIdentifier)?.Value;
            if (userId == null)
            {
                return Unauthorized(); // Se não houver usuário logado, retorne um erro
            }

            var isToWatchLater = _context.UserMedia
                .Any(um => um.UserId == userId && um.MediaInfoModel.IdMedia == mediaId && um.MediaInfoModel.Type == mediaType && (um.IdListMedia == 3 || um.IdListMedia == 4));

            return Ok(new { isToWatchLater });
        }

        /// <summary>
        /// Marca uma media para ser assistida mais tarde por um utilizador.
        /// </summary>
        /// <param name="request">Dados da media a ser marcada para assistir mais tarde.</param>
        /// <returns>Um resultado indicando se a operação foi bem-sucedida.</returns>
        [Authorize]
        [HttpPost("/api/media/mark-to-watch-later")]
        public IActionResult MarkToWatchLater([FromBody] UserMediaDto request)
        {
            var userId = User.FindFirst(ClaimTypes.NameIdentifier)?.Value;
            if (userId == null) return Unauthorized();

            var mediaInfo = _context.MediaInfoModel.FirstOrDefault(mi => mi.IdMedia == request.MediaId && mi.Type == request.Type);
            if (mediaInfo == null)
            {
                mediaInfo = new MediaInfoModel { IdMedia = request.MediaId, Type = request.Type };
                _context.MediaInfoModel.Add(mediaInfo);
                _context.SaveChanges();
            }

            // Remove from 'watched' list if exists
            var existingWatchedEntry = _context.UserMedia.FirstOrDefault(um => um.UserId == userId && um.IdTableMedia == mediaInfo.IdTableMedia && (um.IdListMedia == 1 || um.IdListMedia == 2));
            if (existingWatchedEntry != null) _context.UserMedia.Remove(existingWatchedEntry);

            // Add to 'watch later' list or update existing entry
            var userMedia = _context.UserMedia.FirstOrDefault(um => um.UserId == userId && um.IdTableMedia == mediaInfo.IdTableMedia);
            if (userMedia == null)
            {
                userMedia = new UserMedia { UserId = userId, IdTableMedia = mediaInfo.IdTableMedia, IdListMedia = request.Type == "movie" ? 4 : 3 };
                _context.UserMedia.Add(userMedia);
            }
            else
            {
                userMedia.IdListMedia = request.Type == "movie" ? 4 : 3; // Update if already exists
            }
            _context.SaveChanges();
            bool isWatched = false;

            return Ok(new { isToWatchLater = true, isWatched });
        }

        /// <summary>
        /// Remove a marcação de assistir mais tarde de uma media para um utilizador.
        /// </summary>
        /// <param name="request">Dados da media a ser removida da lista de assistir mais tarde.</param>
        /// <returns>Um resultado indicando se a operação foi bem-sucedida.</returns>
        [Authorize]
        [HttpPost("/api/media/unmark-to-watch-later")]
        public IActionResult UnmarkAsWatchedLater([FromBody] UserMediaDto request)
        {
            var userId = User.FindFirst(ClaimTypes.NameIdentifier)?.Value;
            if (userId == null) return Unauthorized();

            // Encontrar a entrada correspondente em UserMedia na lista 'para assistir mais tarde'
            var userMedia = _context.UserMedia.FirstOrDefault(um => um.UserId == userId && um.MediaInfoModel.IdMedia == request.MediaId && um.MediaInfoModel.Type == request.Type && (um.IdListMedia == 3 || um.IdListMedia == 4));

            if (userMedia == null)
            {
                return NotFound(new { message = "Media não encontrado ou já foi removido da lista 'para assistir mais tarde'." });
            }

            // Remover a entrada da base de dados
            _context.UserMedia.Remove(userMedia);
            _context.SaveChanges();

            return Ok(new { message = "Media removido da lista 'para assistir mais tarde' com sucesso." });
        }

        /// <summary>
        /// Remove a marcação de assistido de uma media para um utilizador.
        /// </summary>
        /// <param name="request">Dados da media a ser removida da lista de assistidos.</param>
        /// <returns>Um resultado indicando se a operação foi bem-sucedida.</returns>
        [Authorize]
        [HttpPost("/api/media/unmark-watched")]
        public IActionResult UnmarkAsWatched([FromBody] UserMediaDto request)
        {
            var userId = User.FindFirst(ClaimTypes.NameIdentifier)?.Value;
            if (userId == null) return Unauthorized();

            // Encontrar a entrada correspondente em UserMedia na lista de assistidos
            var userMedia = _context.UserMedia.FirstOrDefault(um => um.UserId == userId && um.MediaInfoModel.IdMedia == request.MediaId && um.MediaInfoModel.Type == request.Type && (um.IdListMedia == 1 || um.IdListMedia == 2));

            if (userMedia == null)
            {
                return NotFound(new { message = "Media não encontrado ou já foi removido da lista de assistidos." });
            }

            // Remover a entrada da base de dados
            _context.UserMedia.Remove(userMedia);
            _context.SaveChanges();

            return Ok(new { message = "Media removido da lista de assistidos com sucesso." });
        }

        /// <summary>
        /// Obtém a lista de medias assistidas por um utilizador.
        /// </summary>
        /// <param name="username">Nome de utilizador.</param>
        /// <returns>Uma lista de medias assistidas pelo utilizador.</returns>
        [Authorize]
        [HttpGet("/api/media/get-media-watched-list/{username}")]
        public async Task<ActionResult<IEnumerable<UserMediaDto>>> GetWatchedMedia(string username)
        {
            var user = await _context.Users.FirstOrDefaultAsync(u => u.UserName == username);
            if (user == null)
            {
                return NotFound("Utilizador não encontrado.");
            }

            var watchedMedia = await _context.UserMedia
                .Where(um => um.UserId == user.Id && (um.IdListMedia == 1 || um.IdListMedia == 2)) // 1 para filmes, 2 para séries
                .Select(um => new UserMediaDto
                {
                    MediaId = um.MediaInfoModel.IdMedia,
                    Type = um.MediaInfoModel.Type,
                })
                .ToListAsync();

            return Ok(watchedMedia);
        }

        /// <summary>
        /// Obtém a lista de medias marcadas para assistir mais tarde por um utilizador específico.
        /// </summary>
        /// <param name="username">Nome de utilizador do qual se quer obter a lista de medias para assistir mais tarde.</param>
        /// <returns>Uma lista de medias marcadas para assistir mais tarde pelo utilizador.</returns>
        [Authorize]
        [HttpGet("/api/media/get-watch-later-list/{username}")]
        public async Task<ActionResult<IEnumerable<UserMediaDto>>> GetWatchLaterMedia(string username)
        {
            var user = await _context.Users.FirstOrDefaultAsync(u => u.UserName == username);
            if (user == null)
            {
                return NotFound("Utilizador não encontrado.");
            }

            var watchLaterMedia = await _context.UserMedia
                .Where(um => um.UserId == user.Id && (um.IdListMedia == 3 || um.IdListMedia == 4)) // 3 para filmes para assistir mais tarde, 4 para séries
                .Select(um => new UserMediaDto
                {
                    MediaId = um.MediaInfoModel.IdMedia,
                    Type = um.MediaInfoModel.Type,
                })
                .ToListAsync();

            return Ok(watchLaterMedia);
        }
    }

}
