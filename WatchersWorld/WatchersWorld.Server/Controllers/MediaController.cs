using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Identity;
using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;
using System.Security.Claims;
using WatchersWorld.Server.Data;
using WatchersWorld.Server.DTOs.Media;
using WatchersWorld.Server.Models.Media;
using WatchersWorld.Server.Services;
using static System.Runtime.InteropServices.JavaScript.JSType;

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
    public class MediaController(WatchersWorldServerContext context, INotificationService notificationService, ILogger<MediaController> logger, GamificationService gamificationService) : ControllerBase
    {
        private readonly WatchersWorldServerContext _context = context;
        private readonly INotificationService _notificationService = notificationService;
        private readonly GamificationService _gamificationService = gamificationService;
        private readonly ILogger<MediaController> _logger = logger;


        /// <summary>
        /// Marca uma media como favorita por um utilizador.
        /// </summary>
        /// <param name="request">Dados da media a ser marcada como favorita.</param>
        /// <returns>Um resultado indicando se a operação foi bem-sucedida.</returns>
        [Authorize]
        [HttpPost("/api/media/mark-as-favorite")]
        public IActionResult MarkAsFavorite([FromBody] UserMediaDto request)
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

            var existingFavorite = _context.UserMedia
                .FirstOrDefault(um => um.UserId == userId && um.IdTableMedia == mediaInfo.IdTableMedia && um.IdListMedia == 5);

            if (existingFavorite == null)
            {
                var userMedia = new UserMedia { UserId = userId, IdTableMedia = mediaInfo.IdTableMedia, IdListMedia = 5, DateMarked = DateTime.Now };
                _context.UserMedia.Add(userMedia);
                _context.SaveChanges();

                return Ok(new { isFavorite = true });
            }
            else
            {
                return Ok(new { isFavorite = true, message = "Media já selecionado como favorito." });
            }
        }

        /// <summary>
        /// Remove a marcação de favorito de uma media para um utilizador.
        /// </summary>
        /// <param name="request">Dados da media a ser removida da lista de favoritos.</param>
        /// <returns>Um resultado indicando se a operação foi bem-sucedida.</returns>
        [Authorize]
        [HttpPost("/api/media/unmark-favorite")]
        public IActionResult UnmarkAsFavorite([FromBody] UserMediaDto request)
        {
            var userId = User.FindFirst(ClaimTypes.NameIdentifier)?.Value;
            if (userId == null) return Unauthorized();

            var userMedia = _context.UserMedia
                .FirstOrDefault(um => um.UserId == userId && um.MediaInfoModel.IdMedia == request.MediaId && um.MediaInfoModel.Type == request.Type && um.IdListMedia == 5);

            if (userMedia == null)
            {
                return NotFound(new { message = "Media não encontrado ou já foi removido dos favoritos." });
            }

            _context.UserMedia.Remove(userMedia);
            _context.SaveChanges();

            return Ok(new { message = "Media removido dos favoritos com sucesso." });
        }


        /// <summary>
        /// Verifica se uma media específica foi marcada como favorita por um utilizador.
        /// </summary>
        /// <param name="mediaId">Identificador da media.</param>
        /// <param name="mediaType">Tipo da media (ex: filme ou série).</param>
        /// <returns>Um resultado indicando se a media foi marcada como favorita.</returns>
        [Authorize]
        [HttpGet("/api/media/is-favorite/{mediaId}/{mediaType}")]
        public IActionResult IsMediaFavorite(int mediaId, string mediaType)
        {
            var userId = User.FindFirst(ClaimTypes.NameIdentifier)?.Value;
            if (userId == null)
            {
                return Unauthorized();
            }

            var isFavorite = _context.UserMedia
                .Any(um => um.UserId == userId && um.MediaInfoModel.IdMedia == mediaId && um.MediaInfoModel.Type == mediaType && um.IdListMedia == 5);

            return Ok(new { isFavorite });
        }

        /// <summary>
        /// Marca uma media como assistida por um utilizador.
        /// </summary>
        /// <param name="request">Dados da media a ser marcada como assistida.</param>
        /// <returns>Um resultado indicando se a operação foi bem-sucedida.</returns>
        [Authorize]
        [HttpPost("/api/media/mark-watched")]
        public async Task<IActionResult> MarkAsWatched([FromBody] UserMediaDto request)
        {
            var userId = User.FindFirst(ClaimTypes.NameIdentifier)?.Value;
            if (userId == null) return Unauthorized();

            var mediaInfo = await _context.MediaInfoModel
                .FirstOrDefaultAsync(mi => mi.IdMedia == request.MediaId && mi.Type == request.Type);

            if (mediaInfo == null)
            {
                mediaInfo = new MediaInfoModel { IdMedia = request.MediaId, Type = request.Type };
                _context.MediaInfoModel.Add(mediaInfo);
                await _context.SaveChangesAsync();
            }

            // Remove from 'watch later' list if exists
            var existingWatchLaterEntry = await _context.UserMedia
                .FirstOrDefaultAsync(um => um.UserId == userId && um.IdTableMedia == mediaInfo.IdTableMedia && (um.IdListMedia == 3 || um.IdListMedia == 4));
            if (existingWatchLaterEntry != null) _context.UserMedia.Remove(existingWatchLaterEntry);

            // Add to 'watched' list or update existing entry
            var userMedia = await _context.UserMedia
                .FirstOrDefaultAsync(um => um.UserId == userId && um.IdTableMedia == mediaInfo.IdTableMedia);

            if (userMedia == null)
            {
                userMedia = new UserMedia { UserId = userId, IdTableMedia = mediaInfo.IdTableMedia, IdListMedia = request.Type == "movie" ? 1 : 2, DateMarked = DateTime.Now };
                _context.UserMedia.Add(userMedia);
            }
            else
            {
                userMedia.IdListMedia = request.Type == "movie" ? 1 : 2; // Update if already exists
            }

            await _context.SaveChangesAsync(); // Make sure changes are saved before awarding medals

            var user = await _context.Users
                .AsNoTracking()
                .FirstOrDefaultAsync(u => u.Id == userId);

            // Determine which medal to award based on the type of media
            string medalName = request.Type == "movie" ? "Primeiro Filme" : "Primeira Série";
            int medalId = request.Type == "movie" ? 2 : 3;

            // Award the appropriate medal
            var medalAwarded = await _gamificationService.AwardMedalAsync(user.UserName, medalName);
            if (medalAwarded)
            {
                await _notificationService.CreateAchievementNotificationAsync(userId, medalId);

            }

            if (!medalAwarded)
            {
                // Log this information or handle it accordingly
                _logger.LogWarning("Failed to award medal {MedalName} to user {UserName}.", medalName, user.UserName);
            }

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
        public async Task<IActionResult> MarkToWatchLater([FromBody] UserMediaDto request)
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
                userMedia = new UserMedia { UserId = userId, IdTableMedia = mediaInfo.IdTableMedia, IdListMedia = request.Type == "movie" ? 4 : 3 , DateMarked=DateTime.Now};
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
        /// Obtém a lista de medias favoritas de um utilizador.
        /// </summary>
        /// <param name="username">Nome de utilizador.</param>
        /// <returns>Uma lista de medias favoritas do utilizador.</returns>
        [Authorize]
        [HttpGet("/api/media/get-media-favorites-list/{username}")]
        public async Task<ActionResult<IEnumerable<UserMediaDto>>> GetFavoritesMedia(string username)
        {
            var user = await _context.Users.FirstOrDefaultAsync(u => u.UserName == username);
            if (user == null)
            {
                return NotFound("Utilizador não encontrado.");
            }

            var favoritesMedia = await _context.UserMedia
                .Where(um => um.UserId == user.Id && um.IdListMedia == 5) // IdListMedia 5 para favoritos
                .Select(um => new UserMediaDto
                {
                    MediaId = um.MediaInfoModel.IdMedia,
                    Type = um.MediaInfoModel.Type,
                    // Adicione outras propriedades que você precisa enviar de volta ao cliente se necessário
                })
                .ToListAsync();

            return Ok(favoritesMedia);
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


        //COMENTARIOS 


        [HttpPost("/api/media/add-comment")]
        public IActionResult AddComment([FromBody] CreateCommentDto request)
        {
            var userId = User.FindFirst(ClaimTypes.NameIdentifier)?.Value;
            if (userId == null) return Unauthorized();

            var comment = new Comment
            {
                UserId = userId,
                MediaId = request.MediaId,
                Text = request.Text,
                CreatedAt = DateTime.Now
            };

            _context.Comments.Add(comment);
            _context.SaveChanges();

            return Ok(new { message = "Comentário adicionado com sucesso." });
        }
        [HttpGet("/api/media/get-comments/{mediaId}")]
        public ActionResult<IEnumerable<CommentDto>> GetComments(int mediaId)
        {
            var userId = User.FindFirst(ClaimTypes.NameIdentifier)?.Value; // Obter o ID do usuário atual

            // Obter todos os comentários (principais e respostas) para o MediaId fornecido
            var allComments = _context.Comments
                .Where(c => c.MediaId == mediaId)
                .Include(c => c.Likes) // Garantir que os likes sejam incluídos
                .Include(c => c.Dislikes) // Garantir que os dislikes sejam incluídos
                .OrderBy(c => c.CreatedAt) // Pode ordenar como preferir
                .ToList(); // Executa a consulta e obtém os resultados

            // Converter para DTOs
            var commentsDto = allComments.Select(c => new CommentDto
            {
                Id = c.Id,
                ParentCommentId = c.ParentCommentId, // Certifique-se de que essa propriedade exista no seu DTO
                UserName = _context.Users.FirstOrDefault(u => u.Id == c.UserId)?.UserName,
                MediaId = c.MediaId,
                Text = c.Text,
                CreatedAt = c.CreatedAt,
                ProfilePhoto = _context.ProfileInfo.FirstOrDefault(pi => pi.UserId == c.UserId)?.ProfilePhoto,
                LikesCount = c.Likes?.Count ?? 0,
                DislikesCount = c.Dislikes?.Count ?? 0,
                HasLiked = c.Likes?.Any(l => l.UserId == userId) ?? false,
                HasDisliked = c.Dislikes?.Any(d => d.UserId == userId) ?? false
            }).ToList();

            // Construir a hierarquia de comentários e respostas
            var rootComments = commentsDto.Where(c => c.ParentCommentId == null).ToList(); // Comentários principais não têm ParentCommentId
            foreach (var rootComment in rootComments)
            {
                rootComment.Replies = commentsDto.Where(c => c.ParentCommentId == rootComment.Id).ToList(); // Associar respostas ao seu comentário principal
            }

            return Ok(rootComments); // Retorna apenas comentários principais (as respostas estão aninhadas dentro deles)
        }



        // Para postar uma resposta a um comentário
        [Authorize]
        [HttpPost("/api/media/add-comment-reply")]
        public async Task<IActionResult> ReplyCommentAsync([FromBody] CreateCommentDto request)
        {
            var userId = User.FindFirst(ClaimTypes.NameIdentifier)?.Value;
            if (userId == null) return Unauthorized();

            var parentComment = await _context.Comments
                .FirstOrDefaultAsync(c => c.Id == request.ParentCommentId);
            if (parentComment == null) return NotFound("Comentário original não encontrado.");

            var reply = new Comment
            {
                UserId = userId,
                MediaId = request.MediaId,
                Text = request.Text,
                CreatedAt = DateTime.UtcNow,
                ParentCommentId = request.ParentCommentId
            };

            _context.Comments.Add(reply);
            await _context.SaveChangesAsync();

            // Cria a notificação de resposta
            await _notificationService.CreateReplyNotificationAsync(userId, parentComment.UserId, request.MediaId, parentComment.Id, request.Text);

            return Ok(new { message = "Resposta adicionada com sucesso." });
        }


        [Authorize]
        [HttpDelete("/api/media/delete-comment/{commentId}")]
        public IActionResult DeleteComment(int commentId)
        {
            var userId = User.FindFirst(ClaimTypes.NameIdentifier)?.Value;
            if (userId == null) return Unauthorized();

            var comment = _context.Comments.Include(c => c.Replies).SingleOrDefault(c => c.Id == commentId);
            if (comment == null)
            {
                return NotFound(new { message = "Comentário não encontrado." });
            }

            // Get the admin and moderator role IDs in one call
            var adminRoleId = _context.Roles.Where(r => r.Name == "Admin").Select(r => r.Id).FirstOrDefault();
            var moderatorRoleId = _context.Roles.Where(r => r.Name == "Moderator").Select(r => r.Id).FirstOrDefault();

            // Check if the user is an admin or moderator in one call
            bool isUserAdminOrModerator = _context.UserRoles.Any(ur =>
                ur.UserId == userId &&
                (ur.RoleId == adminRoleId || ur.RoleId == moderatorRoleId));

            if (comment.UserId != userId && !isUserAdminOrModerator)
            {
                return BadRequest(new { message = "Você só pode apagar seus próprios comentários." });
            }

            // Remove recursively all child comments
            RemoveChildComments(comment.Id);

            _context.Comments.Remove(comment);
            _context.SaveChanges();

            return Ok(new { message = "Comentário excluído com sucesso." });
        }


        // Método auxiliar para remover comentários filhos
        private void RemoveChildComments(int parentId)
        {
            var childComments = _context.Comments.Where(c => c.ParentCommentId == parentId).ToList();
            foreach (var child in childComments)
            {
                RemoveChildComments(child.Id); // Chama recursivamente para remover filhos dos filhos
                _context.Comments.Remove(child);
            }
        }

        [Authorize]
        [HttpPost("/api/media/like-comment/{commentId}")]
        public IActionResult LikeComment(int commentId)
        {
            var userId = User.FindFirst(ClaimTypes.NameIdentifier)?.Value;
            if (userId == null) return Unauthorized();

            var existingLike = _context.CommentLikes.FirstOrDefault(cl => cl.CommentId == commentId && cl.UserId == userId);
            if (existingLike != null)
            {
                return BadRequest(new { message = "Você já curtiu este comentário." });
            }

            var like = new CommentLike
            {
                CommentId = commentId,
                UserId = userId
            };

            _context.CommentLikes.Add(like);
            _context.SaveChanges();

            return Ok(new { message = "Comentário curtido com sucesso." });
        }
        [Authorize]
        [HttpPost("/api/media/dislike-comment/{commentId}")]
        public IActionResult DisLikeComment(int commentId)
        {
            var userId = User.FindFirst(ClaimTypes.NameIdentifier)?.Value;
            if (userId == null) return Unauthorized();

            var existingDisLike = _context.CommentDislikes.FirstOrDefault(cl => cl.CommentId == commentId && cl.UserId == userId);
            if (existingDisLike != null)
            {
                return BadRequest(new { message = "Você já deu dislike este comentário." });
            }

            var dislike = new CommentDislike
            {
                CommentId = commentId,
                UserId = userId
            };

            _context.CommentDislikes.Add(dislike);
            _context.SaveChanges();

            return Ok(new { message = "Comentário curtido com sucesso." });
        }

        [Authorize]
        [HttpDelete("/api/media/remove-like/{commentId}")]
        public IActionResult RemoveLikeFromComment(int commentId)
        {
            var userId = User.FindFirst(ClaimTypes.NameIdentifier)?.Value;
            if (userId == null) return Unauthorized();

            var like = _context.CommentLikes.FirstOrDefault(cl => cl.CommentId == commentId && cl.UserId == userId);
            if (like == null)
            {
                return NotFound(new { message = "Like não encontrado." });
            }

            _context.CommentLikes.Remove(like);
            _context.SaveChanges();

            return Ok(new { message = "Like removido com sucesso." });
        }

        [Authorize]
        [HttpDelete("/api/media/remove-dislike/{commentId}")]
        public IActionResult RemoveDislikeFromComment(int commentId)
        {
            var userId = User.FindFirst(ClaimTypes.NameIdentifier)?.Value;
            if (userId == null) return Unauthorized();

            var dislike = _context.CommentDislikes.FirstOrDefault(cd => cd.CommentId == commentId && cd.UserId == userId);
            if (dislike == null)
            {
                return NotFound(new { message = "Dislike não encontrado." });
            }

            _context.CommentDislikes.Remove(dislike);
            _context.SaveChanges();

            return Ok(new { message = "Dislike removido com sucesso." });
        }

        [Authorize]
        [HttpGet("/api/media/get-sorted-comments-by-likes/{mediaId}")]
        public ActionResult<IEnumerable<CommentDto>> GetSortedMostLikedComments(int mediaId)
        {
            var result = GetComments(mediaId);

            if (result.Result is OkObjectResult okResult && okResult.Value is IEnumerable<CommentDto> comments)
            {
                var sortedComments = comments
                    .OrderByDescending(c => c.LikesCount)
                    .ToList();

                return Ok(sortedComments);
            }

            return result.Result;
        }

        [HttpGet("/api/media/get-sorted-comments-by-date/{mediaId}")]
        public ActionResult<IEnumerable<CommentDto>> GetSortedMostOldComments(int mediaId)
        {
            var result = GetComments(mediaId);

            if (result.Result is OkObjectResult okResult && okResult.Value is IEnumerable<CommentDto> comments)
            {
                var sortedComments = comments
                    .OrderBy(c => c.CreatedAt)
                    .ToList();

                return Ok(sortedComments);
            }

            return result.Result;
        }

    }



}
