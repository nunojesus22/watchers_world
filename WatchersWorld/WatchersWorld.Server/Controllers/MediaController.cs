using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Identity;
using Microsoft.AspNetCore.Mvc;
using Microsoft.Win32;
using System.Security.Claims;
using WatchersWorld.Server.Data;
using WatchersWorld.Server.DTOs.Media;
using WatchersWorld.Server.DTOs.ProfileInfoDtos;
using WatchersWorld.Server.Models.Authentication;
using WatchersWorld.Server.Models.Media;

namespace WatchersWorld.Server.Controllers
{
    [Authorize]
    [Route("api/[controller]")]
    [ApiController]
    public class MediaController : Controller
    {
        private readonly WatchersWorldServerContext _context;

        public MediaController(WatchersWorldServerContext context)
        {
            _context = context;
        }

        [Authorize]
        [HttpPost("/api/media/mark-watched")]
        public IActionResult MarkAsWatched([FromBody] UserMediaDto request)
        {
            var userId = User.FindFirst(ClaimTypes.NameIdentifier)?.Value; // Obtém o ID do usuário atual
            if (userId == null)
            {
                return Unauthorized(); // Se não houver usuário logado, retorne um erro
            }

            // Lógica para adicionar a mídia em MediaInfoModel e a associação em UserMedia
            var mediaInfo = _context.MediaInfoModel.FirstOrDefault(mi => mi.IdMedia == request.MediaId && mi.Type == request.Type);

            if (mediaInfo == null)
            {
                // Se não existe, cria nova entrada
                mediaInfo = new MediaInfoModel
                {
                    IdMedia = request.MediaId,
                    Type = request.Type
                };
                _context.MediaInfoModel.Add(mediaInfo);
                _context.SaveChanges();
            }

            var userMediaExists = _context.UserMedia
                .Any(um => um.UserId == userId && um.IdTableMedia == mediaInfo.IdTableMedia);

            if (!userMediaExists)
            {
                var listId = request.Type == "movie" ? 1 : 2; // Assumindo 1 para filmes, 2 para séries, ajuste conforme necessário

                var userMedia = new UserMedia
                {
                    UserId = userId,
                    IdTableMedia = mediaInfo.IdTableMedia,
                    IdListMedia = listId // Defina o IdListMedia com base no tipo de mídia
                };

                _context.UserMedia.Add(userMedia);
                _context.SaveChanges();
            }

            return Ok(new { message = "Media marcado como assistido com sucesso." });
        }



    }
}
