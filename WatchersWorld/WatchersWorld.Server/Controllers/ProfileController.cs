using Google;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Http;
using Microsoft.AspNetCore.Identity;
using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;
using System.Security.Claims;
using WatchersWorld.Server.Data;
using WatchersWorld.Server.DTOs.ProfileInfoDtos;
using WatchersWorld.Server.Models.Authentication;

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
            //var userIdClaim = User.FindFirst(ClaimTypes.NameIdentifier)?.Value;

            //if (userIdClaim == null)
            //{
            //    return BadRequest("Não foi possível encontrar o utilizador");
            //}

            var user = await _userManager.Users
                 .FirstOrDefaultAsync(u => u.NormalizedUserName == username.ToUpper());

            Console.WriteLine(user);

            if (user == null)
            {
                return NotFound("Não foi possível encontrar o utilizador");
            }

            var data = _context.ProfileInfo.FirstOrDefault(p => p.UserEmail == user.Email);
            Console.WriteLine(data);


            ProfileInfoDto userProfileDto = new ProfileInfoDto
            {
                UserEmail = data.UserEmail,
                UserName = user.UserName,
                Description = data.Description,
                BirthDate = data.BirthDate,
                Gender = data.Gender,
                ProfilePhoto = data.ProfilePhoto,
                CoverPhoto = data.CoverPhoto,
                ProfileStatus = data.ProfileStatus
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
    }
}
