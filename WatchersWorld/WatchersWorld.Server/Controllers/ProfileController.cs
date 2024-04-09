using Google;
using Mailjet.Client.Resources;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Http;
using Microsoft.AspNetCore.Http.HttpResults;
using Microsoft.AspNetCore.Identity;
using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;
using Microsoft.IdentityModel.Tokens;
using System.Security.Claims;
using WatchersWorld.Server.Data;
using WatchersWorld.Server.DTOs;
using WatchersWorld.Server.DTOs.ProfileInfoDtos;
using WatchersWorld.Server.Models.Authentication;
using WatchersWorld.Server.Services;
using static System.Runtime.InteropServices.JavaScript.JSType;
using User = WatchersWorld.Server.Models.Authentication.User; // Alias para o User do seu domínio

namespace WatchersWorld.Server.Controllers
{
    /// <summary>
    /// Controlador responsável pela gestão de perfis de utilizadores, incluindo a obtenção de informações de perfil,
    /// atualização de informações de perfil, e gestão de seguidores.
    /// </summary>
    /// <remarks>
    /// Construtor que inicializa uma nova instância do controlador ProfileController.
    /// </remarks>
    /// <param name="context">Contexto da base de dados.</param>
    /// <param name="userManager">Gestor de utilizadores.</param>
    /// <param name="logger">Logger para registar eventos ou erros.</param>
    /// <param name="followersService">Serviço para gestão de seguidores.</param>
    [Authorize]
    [Route("api/[controller]")]
    [ApiController]
    public class ProfileController(WatchersWorldServerContext context, UserManager<User> userManager, ILogger<ProfileController> logger, IProfileService profileService, IFollowersService followersService, INotificationService notificationService, IGamificationService gamificationService) : ControllerBase
    {
        private readonly WatchersWorldServerContext _context = context;
        private readonly UserManager<User> _userManager = userManager;
        private readonly ILogger<ProfileController> _logger = logger;
        private readonly IProfileService _profileService = profileService;
        private readonly IFollowersService _followersService = followersService;
        private readonly INotificationService _notificationService = notificationService;
        private readonly IGamificationService _gamificationService = gamificationService;


        /// <summary>
        /// Obtém informações de perfil para um utilizador especificado.
        /// </summary>
        /// <param name="username">Nome de utilizador do perfil a ser obtido.</param>
        /// <returns>Informações de perfil do utilizador.</returns>
        [HttpGet("get-user-info/{username}")]
        public async Task<ActionResult<ProfileInfoDto>> GetUser(string username)
        {
            var userProfileDto = await _profileService.GetUserProfileAsync(username);

            if (userProfileDto == null)
            {
                return NotFound("Não foi possível encontrar o utilizador");
            }

            return userProfileDto;
        }

        /// <summary>
        /// Atualiza informações de perfil para o utilizador autenticado.
        /// </summary>
        /// <param name="model">Dados do perfil para atualização.</param>
        /// <returns>Resultado da operação de atualização.</returns>
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

            var updateSuccessful = await _profileService.UpdateUserProfileAsync(userIdClaim, model);

            if (!updateSuccessful)
            {
                return BadRequest("Não foi possível atualizar o perfil do utilizador");
            }

            var data = _context.ProfileInfo.FirstOrDefault(p => p.UserName == user.UserName);

            // Logic to handle the medal awarding if needed
            bool medalAwarded = await _gamificationService.AwardMedalAsync(data.UserName, "Editar perfil");
            if (medalAwarded)
            {
                await _notificationService.CreateAchievementNotificationAsync(data.UserId, 5);
            }
            else
            {
                _logger.LogWarning("Medal was not awarded for user {UserName}.", model.UserName);
            }

            return Ok(new JsonResult(new
            {
                title = "Perfil atualizado",
                message = "Os seus dados foram alterados com sucesso."
            }));
        }

        /// <summary>
        /// Permite a um utilizador autenticado seguir outro utilizador.
        /// </summary>
        /// <param name="usernameAuthenticated">Nome do utilizador que pretende seguir outro.</param>
        /// <param name="usernameToFollow">Nome do utilizador a ser seguido.</param>
        /// <returns>Resultado da operação de seguir.</returns>
        [AllowAnonymous]
        [HttpPost("follow/{usernameAuthenticated}/{usernameToFollow}")]
        public async Task<IActionResult> FollowUser(string usernameAuthenticated, string usernameToFollow)
        {
            var userAuthenticated = await _userManager.FindByNameAsync(usernameAuthenticated);
            var userIdAuthenticated = userAuthenticated.Id;

            var userToFollow = await _userManager.FindByNameAsync(usernameToFollow);
            var userIdToFollow = userToFollow.Id;

            var result = await _followersService.Follow(userIdAuthenticated, userIdToFollow);
            if (!result)
            {
                return BadRequest("Não foi possível seguir o utilizador pretendido.");
            }

            var isApproved = !await _followersService.FollowIsPending(userIdAuthenticated, userIdToFollow);
            if (isApproved)
            {
                var currentUserProfile = await _context.ProfileInfo.FirstOrDefaultAsync(p => p.UserName == usernameAuthenticated);
                var userProfileToFollow = await _context.ProfileInfo.FirstOrDefaultAsync(p => p.UserName == usernameToFollow);

                currentUserProfile.Following++;
                userProfileToFollow.Followers++;

                var medalAwarded = await _gamificationService.AwardMedalAsync(userAuthenticated.UserName, "Seguir um utilizador");
                if (medalAwarded)
                {
                    await _notificationService.CreateAchievementNotificationAsync(userIdAuthenticated, 4);

                }
                if (!medalAwarded)
                {
                    // Handle the case where the medal was not awarded. You may log this or take another action.
                    _logger.LogWarning("The medal for following a user was not awarded to user with ID {UserId}.", userIdAuthenticated);
                }

                await _notificationService.CreateFollowNotificationAsync(userIdAuthenticated, userIdToFollow);

            }

            await _context.SaveChangesAsync();
            return Ok();
        }



        /// <summary>
        /// Permite a um utilizador autenticado deixar de seguir outro utilizador.
        /// </summary>
        /// <param name="usernameAuthenticated">Nome do utilizador que pretende deixar de seguir.</param>
        /// <param name="usernameToFollow">Nome do utilizador a ser deixado de seguir.</param>
        /// <returns>Resultado da operação de deixar de seguir.</returns>
        [AllowAnonymous]
        [HttpDelete("unfollow/{usernameAuthenticated}/{usernameToFollow}")]
        public async Task<IActionResult> UnfollowUser(string usernameAuthenticated, string usernameToFollow)
        {
            var userAuthenticated = await _userManager.FindByNameAsync(usernameAuthenticated);
            var userIdAuthenticated = userAuthenticated.Id;

            var userToFollow = await _userManager.FindByNameAsync(usernameToFollow);
            var userIdToFollow = userToFollow.Id;

            var isPending = await _followersService.FollowIsPending(userIdAuthenticated, userIdToFollow);

            var result = await _followersService.Unfollow(userIdAuthenticated, userIdToFollow);
            switch (result)
            {
                case false:
                    return BadRequest("Não foi possível deixar de seguir o utilizador pretendido.");
                case true:
                    if (!isPending)
                    {
                        var currentUserProfile = await _context.ProfileInfo.FirstOrDefaultAsync(p => p.UserName == usernameAuthenticated);
                        var userProfileToFollow = await _context.ProfileInfo.FirstOrDefaultAsync(p => p.UserName == usernameToFollow);

                        currentUserProfile.Following--;
                        userProfileToFollow.Followers--;
                    }
                    break;
            }

            try
            {
                await _context.SaveChangesAsync();
                return Ok(new { message = "Você deixou de seguir " + usernameToFollow + " com sucesso." });
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "Ocorreu um erro ao deixar de seguir o utilizador.");
                return StatusCode(500, "Não foi possível deixar de seguir o utilizador.");
            }
        }

        /// <summary>
        /// Obtém a lista de perfis de todos os utilizadores.
        /// </summary>
        /// <returns>Uma lista de informações de perfil.</returns>
        [HttpGet("get-users-profiles")]
        public async Task<ActionResult<List<ProfileInfo>>> GetUsersProfile()
        {
            try
            {
                // Query all users from the database
                var userProfiles = await _context.ProfileInfo.ToListAsync();

                // Map the users to ProfileInfo with selected properties
                var profilesList = userProfiles.Select(profile => new ProfileInfo
                {
                    UserName = profile.UserName,
                    ProfilePhoto = profile.ProfilePhoto,
                    StartBanDate = profile.StartBanDate, 
                    EndBanDate = profile.EndBanDate
                });

                return Ok(profilesList);
            }
            catch (Exception ex)
            {
                // Log the exception or handle it as appropriate for your application
                _logger.LogError(ex, "Error while getting users' profiles");
                return StatusCode(500, "Internal server error");
            }
        }

        /// <summary>
        /// Obtém a lista de perfis de todos os utilizadores excepto o logado.
        /// </summary>
        /// <returns>Uma lista de informações de perfil.</returns>
        [HttpGet("get-users-profiles-not-logged-in/{loggedUserName}")]
        public async Task<ActionResult<List<ProfileInfo>>> GetUsersProfileNotLoggedIn(string loggedUserName)
        {
            try
            {
                // Query all users from the database excluding the logged in user
                var userProfiles = await _context.ProfileInfo
                                        .Where(u => u.UserName.ToLower() != loggedUserName)
                                        .ToListAsync();

                // Map the users to ProfileInfo with selected properties
                var profilesList = userProfiles.Select(profile => new ProfileInfo
                {
                    UserName = profile.UserName.ToLower(),
                    ProfilePhoto = profile.ProfilePhoto,
                    StartBanDate = profile.StartBanDate,
                    EndBanDate = profile.EndBanDate
                });

                return Ok(profilesList);
            }
            catch (Exception ex)
            {
                // Log the exception or handle it as appropriate for your application
                _logger.LogError(ex, "Error while getting users' profiles");
                return StatusCode(500, "Internal server error");
            }
        }

        /// <summary>
        /// Obtém os seguidores de um utilizador especificado.
        /// </summary>
        /// <param name="username">O nome do utilizador para o qual os seguidores serão obtidos.</param>
        /// <returns>Uma lista de seguidores do utilizador.</returns>
        [AllowAnonymous]
        [HttpGet("get-followers/{username}")]
        public async Task<IActionResult> GetFollowers(string username)
        {
            try
            {
                var user = await _userManager.FindByNameAsync(username);
                var result = await _followersService.GetFollowers(user.Id);

                var allProfilesFollowers = _context.ProfileInfo.Where(p => result.Contains(p.UserId.ToString()))
                                                                .Select(profile => new FollowerDto
                                                                {
                                                                    Username = profile.UserName,
                                                                    ProfilePhoto = profile.ProfilePhoto
                                                                });

                return Ok(allProfilesFollowers);
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "Error while getting users' profiles");
                return StatusCode(500, "Internal server error");
            }
        }

        /// <summary>
        /// Obtém os utilizadores que um determinado utilizador está a seguir.
        /// </summary>
        /// <param name="username">O nome do utilizador para o qual se quer obter a lista de seguindo.</param>
        /// <returns>Uma lista de perfis que o utilizador está a seguir.</returns>
        [AllowAnonymous]
        [HttpGet("get-whoFollow/{username}")]
        public async Task<IActionResult> GetWhoFollow(string username)
        {
            try
            {
                var user = await _userManager.FindByNameAsync(username);
                var result = await _followersService.GetWhoFollow(user.Id);

                var allProfilesFollowers = _context.ProfileInfo.Where(p => result.Contains(p.UserId.ToString()))
                                                                .Select(profile => new FollowerDto
                                                                {
                                                                    Username = profile.UserName,
                                                                    ProfilePhoto = profile.ProfilePhoto
                                                                });

                return Ok(allProfilesFollowers);
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "Error while getting users' profiles");
                return StatusCode(500, "Internal server error");
            }
        }

        /// <summary>
        /// Obtém os pedidos de seguimento pendentes enviados para um utilizador.
        /// </summary>
        /// <param name="username">O nome do utilizador para o qual se quer obter os pedidos de seguimento pendentes.</param>
        /// <returns>Uma lista de pedidos de seguimento pendentes.</returns>
        [AllowAnonymous]
        [HttpGet("get-whosPending/{username}")]
        public async Task<IActionResult> GetWhosPending(string username)
        {
            try
            {
                var user = await _userManager.FindByNameAsync(username);
                var result = await _followersService.GetPendingsSend(user.Id);

                var allProfilesFollowers = _context.ProfileInfo.Where(p => result.Contains(p.UserId.ToString()))
                                                                .Select(profile => new FollowerDto
                                                                {
                                                                    Username = profile.UserName,
                                                                    ProfilePhoto = profile.ProfilePhoto
                                                                });

                return Ok(allProfilesFollowers);
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "Error while getting users' profiles");
                return StatusCode(500, "Internal server error");
            }
        }

        /// <summary>
        /// Aceita um pedido de seguimento de um utilizador para outro.
        /// </summary>
        /// <param name="usernameAuthenticated">Nome do utilizador que está a aceitar o seguimento.</param>
        /// <param name="usernameWhoSend">Nome do utilizador que enviou o pedido de seguimento.</param>
        /// <returns>Resultado da operação de aceitação do seguimento.</returns>
        [AllowAnonymous]
        [HttpPost("acceptFollow/{usernameAuthenticated}/{usernameWhoSend}")]
        public async Task<IActionResult> AcceptFollow(string usernameAuthenticated, string usernameWhoSend)
        {
            var userAuthenticated = await _userManager.FindByNameAsync(usernameAuthenticated);
            var userIdAuthenticated = userAuthenticated.Id;

            var userWhoSend = await _userManager.FindByNameAsync(usernameWhoSend);
            var userIdWhoSend = userWhoSend.Id;

            var result = await _followersService.AcceptFollowSend(userIdAuthenticated, userIdWhoSend);
            switch (result)
            {
                case false:
                    return BadRequest("Não foi possível seguir o utilizador pretendido.");
                case true:
                    var currentUserProfile = await _context.ProfileInfo.FirstOrDefaultAsync(p => p.UserName == usernameAuthenticated);
                    var userProfileToFollow = await _context.ProfileInfo.FirstOrDefaultAsync(p => p.UserName == usernameWhoSend);

                    currentUserProfile.Followers++;
                    userProfileToFollow.Following++;

                    await _notificationService.CreateFollowNotificationAsync(userIdWhoSend, userIdAuthenticated);

                    break;
            }

            try
            {
                await _context.SaveChangesAsync();
                return Ok(new { message = "Agora " + usernameWhoSend + " já o segue."});
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "Ocorreu um erro ao seguir o utilizador.");
                return StatusCode(500, "Não foi possível seguir o utilizador.");
            }
        }

        /// <summary>
        /// Rejeita um pedido de seguimento de um utilizador para outro.
        /// </summary>
        /// <param name="usernameAuthenticated">Nome do utilizador que está a rejeitar o seguimento.</param>
        /// <param name="usernameWhoSend">Nome do utilizador que enviou o pedido de seguimento.</param>
        /// <returns>Resultado da operação de rejeição do seguimento.</returns>
        [AllowAnonymous]
        [HttpDelete("rejectFollow/{usernameAuthenticated}/{usernameWhoSend}")]
        public async Task<IActionResult> RejectFollow(string usernameAuthenticated, string usernameWhoSend)
        {
            var userAuthenticated = await _userManager.FindByNameAsync(usernameAuthenticated);
            var userIdAuthenticated = userAuthenticated.Id;

            var userWhoSend = await _userManager.FindByNameAsync(usernameWhoSend);
            var userIdWhoSend = userWhoSend.Id;

            var result = await _followersService.RejectFollowSend(userIdAuthenticated, userIdWhoSend);
            if(!result) return BadRequest("Não foi possível seguir o utilizador pretendido.");

            try
            {
                await _context.SaveChangesAsync();
                return Ok(new { message = "Você rejeitou o pedido de " + usernameWhoSend + " para o seguir." });
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "Ocorreu um erro ao seguir o utilizador.");
                return StatusCode(500, "Não foi possível seguir o utilizador.");
            }
        }

        /// <summary>
        /// Verifica se um utilizador está a seguir outro utilizador.
        /// </summary>
        /// <param name="usernameAuthenticated">Nome do utilizador que pode estar a seguir o outro.</param>
        /// <param name="usernameToFollow">Nome do utilizador que pode estar a ser seguido.</param>
        /// <returns>Um valor booleano indicando se o utilizador está a seguir o outro utilizador.</returns>
        [AllowAnonymous]
        [HttpGet("alreadyFollows/{usernameAuthenticated}/{usernameToFollow}")]
        public async Task<IActionResult> IsFollowing(string usernameAuthenticated, string usernameToFollow)
        {
            var userAuthenticated = await _userManager.FindByNameAsync(usernameAuthenticated);
            var userIdAuthenticated = userAuthenticated.Id;

            var userToFollow = await _userManager.FindByNameAsync(usernameToFollow);
            var userIdToFollow = userToFollow.Id;

            var isFollowing = await _followersService.AlreadyFollow(userIdAuthenticated,userIdToFollow);
            return Ok(isFollowing);
        }



        [HttpDelete("deleteAccount/{usernameAuthenticated}")]
        public async Task<IActionResult> DeleteAccount(string usernameAuthenticated)
        {
            var userName = usernameAuthenticated;
            if (string.IsNullOrEmpty(userName))
            {
                return BadRequest("User is not authenticated.");
            }

            var result = await _profileService.DeleteOwnAccountAsync(userName);

            if (result == "Your account and profile info have been successfully deleted.")
            {
                return Ok(new { message = result });
            }
            else
            {
                return BadRequest(new { error = result });
            }
        }
    }
}
