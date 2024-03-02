using Google;
using Mailjet.Client.Resources;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Http;
using Microsoft.AspNetCore.Identity;
using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;
using System.Security.Claims;
using WatchersWorld.Server.Data;
using WatchersWorld.Server.DTOs.ProfileInfoDtos;
using WatchersWorld.Server.Models.Authentication;
using User = WatchersWorld.Server.Models.Authentication.User; // Alias para o User do seu domínio

namespace WatchersWorld.Server.Controllers
{
    [Authorize]
    [Route("api/[controller]")]
    [ApiController]
    public class ProfileController : ControllerBase
    {
        private readonly WatchersWorldServerContext _context;
        private readonly UserManager<User> _userManager;
        private readonly ILogger<ProfileController> _logger;

        public ProfileController(WatchersWorldServerContext context, UserManager<User> userManager, ILogger<ProfileController> logger)
        {
            _context = context;
            _userManager = userManager;
            _logger = logger;
        }

        [HttpGet("get-profile")]
        public IActionResult GetProfile()
        {
            return Ok(new JsonResult(new { message = "Apenas para logados." }));
        }

        [HttpGet("get-usersProfile")]
        public async Task<ActionResult<List<ProfileInfo>>> GetUsersProfile()
        {
            try
            {
                // Get the email of the currently logged-in user
                var currentUserEmail = User.FindFirst(ClaimTypes.Email)?.Value;

                // Query all users from the database excluding the current user
                var userProfiles = await _context.ProfileInfo
                    .Where(profile => profile.UserEmail != currentUserEmail)
                    .ToListAsync();

                // Map the users to ProfileInfo with selected properties
                var profilesList = userProfiles.Select(async profile =>
                {
                    var user = await _userManager.FindByEmailAsync(profile.UserEmail);
                    return new ProfileInfo
                    {
                        UserName = user != null ? user.UserName : string.Empty,
                        UserEmail = profile.UserEmail,
                        ProfilePhoto = profile.ProfilePhoto
                    };
                });

                return Ok(await Task.WhenAll(profilesList));
            }
            catch (Exception ex)
            {
                // Log the exception or handle it as appropriate for your application
                _logger.LogError(ex, "Error while getting users' profiles");
                return StatusCode(500, "Internal server error");
            }
        }

        [HttpGet("get-user-info/{username}")]
        public async Task<ActionResult<ProfileInfoDto>> GetUser(string username)
        {
            var user = await _userManager.Users
                 .FirstOrDefaultAsync(u => u.NormalizedUserName == username.ToUpper());

            if (user == null)
            {
                return NotFound("Não foi possível encontrar o utilizador");
            }

            var data = _context.ProfileInfo.FirstOrDefault(p => p.UserEmail == user.Email);

            ProfileInfoDto userProfileDto = new ProfileInfoDto
            {
                UserEmail = data.UserEmail,
                UserName = user.UserName,
                Description = data.Description,
                BirthDate = data.BirthDate,
                Gender = data.Gender,
                ProfilePhoto = data.ProfilePhoto,
                CoverPhoto = data.CoverPhoto,
                ProfileStatus = data.ProfileStatus,
                Followers = data.Followers,
                Following = data.Following
            };

            return userProfileDto;
        }

        [HttpPut("update-user-info")]
        public async Task<ActionResult> UpdateUserInfo(ProfileInfoDto model)
        {
            var userIdClaim = User.FindFirst(ClaimTypes.NameIdentifier)?.Value;

            if (userIdClaim == null)
            {
                return BadRequest("Não foi possível encontrar o utilizador");
            }

            var user = await _userManager.FindByIdAsync(userIdClaim);

            if (user == null)
            {
                return NotFound("Não foi possível encontrar o utilizador");
            }

            var data = _context.ProfileInfo.FirstOrDefault(p => p.UserEmail == user.Email);

            try
            {
                user.UserName = model.UserName;
                data.Description = model.Description;
                data.Gender = model.Gender;
                data.BirthDate = model.BirthDate;
                data.CoverPhoto = model.CoverPhoto;
                data.ProfilePhoto = model.ProfilePhoto;
                data.ProfileStatus = model.ProfileStatus;

                _context.ProfileInfo.Update(data);

                var result = await _context.SaveChangesAsync();

                if (result > 0)
                    return Ok(new JsonResult(new { title = "Perfil atualizado", 
                        message = "Os seus dados foram alterados com sucesso." }));
                return BadRequest("Não foi possivel alterar os seus dados.Tente Novamente.");

            }
            catch (Exception)
            {
                return BadRequest("Não foi possivel alterar os seus dados.Tente Novamente.");
            }
        }

        [HttpPost("follow/{usernameToFollow}")]
        public async Task<IActionResult> FollowUser(string usernameToFollow)
        {
            var userId = User.FindFirst(ClaimTypes.NameIdentifier)?.Value;
            if (userId == null)
            {
                return BadRequest("Usuário não autenticado.");
            }

            _logger.LogInformation($"ID do usuário logado: {userId}");

            var currentUser = await _userManager.FindByIdAsync(userId);

            _logger.LogInformation($"Nome de usuário logado: {currentUser.UserName}");

            var userToFollow = await _userManager.FindByNameAsync(usernameToFollow);

            if (userToFollow == null)
            {
                return NotFound("Usuário a seguir não encontrado.");
            }

            _logger.LogInformation($"Usuário '{currentUser.UserName}' tentando seguir '{userToFollow.UserName}'.");

            var currentUserProfile = await _context.ProfileInfo
                .FirstOrDefaultAsync(p => p.UserEmail == currentUser.Email);

            if (currentUserProfile == null)
            {
                _logger.LogError("Perfil do usuário atual não foi encontrado.");
                return StatusCode(500, "Erro interno do servidor.");
            }

            if (currentUserProfile.Following.Contains(userToFollow.UserName))
            {
                return BadRequest("Você já segue este usuário.");
            }

            var userProfileToFollow = await _context.ProfileInfo
                .FirstOrDefaultAsync(p => p.UserEmail == userToFollow.Email);

            if (userProfileToFollow == null)
            {
                _logger.LogError("Perfil do usuário a seguir não foi encontrado.");
                return StatusCode(500, "Erro interno do servidor.");
            }

            // Inicializa as listas de Followers e Following se ainda não foram inicializadas.
            userProfileToFollow.Followers ??= new List<string>();
            currentUserProfile.Following ??= new List<string>();

            // Adicione o usuário atual à lista de seguidores do usuário alvo e vice-versa.
            userProfileToFollow.Followers.Add(currentUser.UserName);
            currentUserProfile.Following.Add(userToFollow.UserName);

            try
            {
                await _context.SaveChangesAsync();
                return Ok(new { message = "Você está agora seguindo " + usernameToFollow });
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "Ocorreu um erro ao adicionar um seguidor.");
                return StatusCode(500, "Não foi possível seguir o usuário.");
            }
        }

        [HttpDelete("unfollow/{usernameToUnfollow}")]
        public async Task<IActionResult> UnfollowUser(string usernameToUnfollow)
        {
            var userId = User.FindFirst(ClaimTypes.NameIdentifier)?.Value;
            if (userId == null)
            {
                return BadRequest("Usuário não autenticado.");
            }

            var currentUser = await _userManager.FindByIdAsync(userId);
            var userToUnfollow = await _userManager.FindByNameAsync(usernameToUnfollow);

            if (userToUnfollow == null)
            {
                return NotFound("Usuário a deixar de seguir não encontrado.");
            }

            var currentUserProfile = await _context.ProfileInfo
                .FirstOrDefaultAsync(p => p.UserEmail == currentUser.Email);
            var userProfileToUnfollow = await _context.ProfileInfo
                .FirstOrDefaultAsync(p => p.UserEmail == userToUnfollow.Email);

            if (currentUserProfile == null || userProfileToUnfollow == null)
            {
                return StatusCode(500, "Erro interno do servidor.");
            }

            if (!currentUserProfile.Following.Contains(userToUnfollow.UserName))
            {
                return BadRequest("Você não segue este usuário.");
            }

            currentUserProfile.Following.Remove(userToUnfollow.UserName);
            userProfileToUnfollow.Followers.Remove(currentUser.UserName);

            try
            {
                await _context.SaveChangesAsync();
                return Ok(new { message = "Você deixou de seguir " + usernameToUnfollow });
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "Ocorreu um erro ao remover um seguidor.");
                return StatusCode(500, "Não foi possível deixar de seguir o usuário.");
            }
        }
    }
}
