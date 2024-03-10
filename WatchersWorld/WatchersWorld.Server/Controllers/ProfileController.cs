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
    [Authorize]
    [Route("api/[controller]")]
    [ApiController]
    public class ProfileController : ControllerBase
    {
        private readonly WatchersWorldServerContext _context;
        private readonly UserManager<User> _userManager;
        private readonly ILogger<ProfileController> _logger;
        private readonly IFollowersService _followersService;

        public ProfileController(WatchersWorldServerContext context, UserManager<User> userManager, ILogger<ProfileController> logger, IFollowersService followersService)
        {
            _context = context;
            _userManager = userManager;
            _logger = logger;
            _followersService = followersService;
        }

        [HttpGet("get-profile")]
        public IActionResult GetProfile()
        {
            return Ok(new JsonResult(new { message = "Apenas para logados." }));
        }

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
                    ProfilePhoto = profile.ProfilePhoto
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

        [HttpGet("get-user-info/{username}")]
        public async Task<ActionResult<ProfileInfoDto>> GetUser(string username)
        {
            var user = await _userManager.Users
                 .FirstOrDefaultAsync(u => u.UserName == username);

            if (user == null)
            {
                return NotFound("Não foi possível encontrar o utilizador");
            }

            var data = _context.ProfileInfo.FirstOrDefault(p => p.UserName == user.UserName);

            ProfileInfoDto userProfileDto = new ProfileInfoDto
            {
                UserName = data.UserName,
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

            var data = _context.ProfileInfo.FirstOrDefault(p => p.UserName == user.UserName);

            try
            {
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

        [AllowAnonymous]
        [HttpPost("follow/{usernameAuthenticated}/{usernameToFollow}")]
        public async Task<IActionResult> FollowUser(string usernameAuthenticated, string usernameToFollow)
        {
            var userAuthenticated = await _userManager.FindByNameAsync(usernameAuthenticated);
            var userIdAuthenticated = userAuthenticated.Id;

            var userToFollow = await _userManager.FindByNameAsync(usernameToFollow);
            var userIdToFollow = userToFollow.Id;

            var result = await _followersService.Follow(userIdAuthenticated, userIdToFollow);
            switch (result)
            {
                case false:
                    return BadRequest("Não foi possível seguir o utilizador pretendido.");
                case true:
                    var currentUserProfile = await _context.ProfileInfo.FirstOrDefaultAsync(p => p.UserName == usernameAuthenticated);
                    var userProfileToFollow = await _context.ProfileInfo.FirstOrDefaultAsync(p => p.UserName == usernameToFollow);

                    currentUserProfile.Following++;
                    userProfileToFollow.Followers++;
                    break;
            }

            try
            {
                await _context.SaveChangesAsync();
                return Ok(new { message = "Você agora segue " + usernameToFollow });
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "Ocorreu um erro ao seguir o utilizador.");
                return StatusCode(500, "Não foi possível seguir o utilizador.");
            }
        }


        [AllowAnonymous]
        [HttpDelete("unfollow/{usernameAuthenticated}/{usernameToFollow}")]
        public async Task<IActionResult> UnfollowUser(string usernameAuthenticated, string usernameToFollow)
        {
            var userAuthenticated = await _userManager.FindByNameAsync(usernameAuthenticated);
            var userIdAuthenticated = userAuthenticated.Id;

            var userToFollow = await _userManager.FindByNameAsync(usernameToFollow);
            var userIdToFollow = userToFollow.Id;

            var result = await _followersService.Unfollow(userIdAuthenticated, userIdToFollow);
            switch (result)
            {
                case false:
                    return BadRequest("Não foi possível deixar de seguir o utilizador pretendido.");
                case true:
                    var currentUserProfile = await _context.ProfileInfo.FirstOrDefaultAsync(p => p.UserName == usernameAuthenticated);
                    var userProfileToFollow = await _context.ProfileInfo.FirstOrDefaultAsync(p => p.UserName == usernameToFollow);

                    currentUserProfile.Following--;
                    userProfileToFollow.Followers--;
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
    }
}
