using Microsoft.AspNetCore.Identity;
using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;
using Google.Apis.Auth;
using Mailjet.Client.TransactionalEmails;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.WebUtilities;
using NuGet.Versioning;
using System.Security.Claims;
using System.Text;
using WatchersWorld.Server.Data;
using WatchersWorld.Server.DTOs.Account;
using WatchersWorld.Server.Models.Authentication;
using WatchersWorld.Server.Services;

namespace WatchersWorld.Server.Controllers
{
    /// <summary>
    /// Controller handling admin account-related requests such as authentication, registration, email confirmation, and password management.
    /// </summary>
    [Microsoft.AspNetCore.Components.Route("api/[controller]")]
    [ApiController]
    public class AdminController : ControllerBase
    {

        // Manager for user-related operations.
        private readonly UserManager<User> _userManager;
        private readonly EmailService _emailService;
        private readonly IAdminService _adminService;

        private readonly ILogger<AccountController> _logger;


        private WatchersWorldServerContext _context;

        // Constructor for dependency injection.
        public AdminController(UserManager<User> userManager, EmailService emailService, WatchersWorldServerContext context, ILogger<AccountController> logger, IAdminService adminService)
        /// <summary>
        /// Constructor for AccountController.
        /// </summary>
        /// <param name="jWTService">Service for generating JWT tokens.</param>
        /// <param name="signInManager">Manager for handling sign-in processes.</param>
        /// <param name="userManager">Manager for user-related operations.</param>
        /// <param name="emailService">Service for handling email operations.</param>
        /// <param name="config">Application configuration settings.</param>
        {

            _userManager = userManager;
            _emailService = emailService;
            _context = context;
            _logger = logger;
            _adminService = adminService;


        }



        [HttpGet("api/admin/getUserRole/{username}")]
        public async Task<ActionResult<string[]>> GetUserRole(string username)
        {
            try
            {
                var roles = await _adminService.GetUserRoleAsync(username);
                return Ok(roles);
            }
            catch (KeyNotFoundException ex)
            {
                return NotFound(ex.Message);
            }
        }


        [HttpPost("api/admin/ban-user-permanently/{username}")]
        //[Authorize(Roles = "Admin")] // Ensure only admins can perform this action
        public async Task<IActionResult> BanUserPermanently(string username)
        {
            var message = await _adminService.BanUserPermanentlyAsync(username);
            if (message == "User not found." || message == "User profile info not found.")
            {
                return NotFound(message);
            }
            return Ok(new { message });
        }

        [HttpPost("api/admin/ban-user-temporarily/{username}")]
        //[Authorize(Roles = "Admin")] // Ensure only admins can perform this action
        public async Task<IActionResult> BanUserTemporarily(string username, [FromQuery] int banDurationInDays)
        {
            var result = await _adminService.BanUserTemporarilyAsync(username, banDurationInDays);
            if (result.Contains("not found"))
            {
                return NotFound(result);
            }
            return Ok(new { message = result });
        }



        [HttpDelete("api/admin/users/{username}")]
        //[Authorize(Roles = "Admin")] // Ensuring that only authorized users can perform this action
        public async Task<IActionResult> DeleteUserByUsername(string username)
        {
            var result = await _adminService.DeleteUserByUsernameAsync(username);
            if (result.Contains("not found"))
            {
                return NotFound(result);
            }
            else if (result.Contains("Error"))
            {
                return BadRequest(result);
            }
            return Ok(new { message = result });
        }

        [HttpPut("api/admin/unban-user/{username}")]
        //[Authorize(Roles = "Admin")] // Ensure only admins can perform this action
        public async Task<IActionResult> UnbanUser(string username)
        {
            var result = await _adminService.UnbanUserAsync(username);
            if (result == "User not found." || result == "User profile info not found.")
            {
                return NotFound(result);
            }
            return Ok(new { message = result });

        }



        [HttpPut("api/admin/change-role-to-moderator/{username}")]
        public async Task<IActionResult> ChangeRoleToModerator(string username)
        {
            var result = await _adminService.ChangeRoleToModeratorAsync(username);
            if (result == "User not found.")
            {
                return NotFound(result);
            }
            else if (result.Contains("Failed"))
            {
                return BadRequest(result);
            }
            return Ok(new { message = result });
        }


        [HttpPut("api/admin/change-role-to-user/{username}")]
        public async Task<IActionResult> ChangeRoleToUser(string username)
        {
            var result = await _adminService.ChangeRoleToUserAsync(username);
            if (result == "User not found.")
            {
                return NotFound(result);
            }
            else if (result.Contains("Failed"))
            {
                return BadRequest(result);
            }
            return Ok(new { message = result });
        }


        // In ProfileController.cs or a relevant controller

        //[HttpGet("api/admin/total-banned-users")]
        //public async Task<ActionResult<int>> GetTotalBannedUsers()
        //{
        //    int totalBannedUsers = await _context.ProfileInfo.CountAsync(p => p.IsBanned);
        //    return Ok(totalBannedUsers);
        //}

        [HttpGet("api/admin/total-registered-users")]
        public async Task<ActionResult<int>> GetTotalRegisteredUsers()
        {
            var totalUsers = await _userManager.Users.CountAsync();
            return Ok(totalUsers);
        }

        [HttpGet("api/admin/total-private-profiles")]
        public async Task<ActionResult<int>> GetTotalPrivateProfiles()
        {
            int totalPrivateProfiles = await _context.ProfileInfo.CountAsync(p => p.ProfileStatus == "Private");
            return Ok(totalPrivateProfiles);
        }

        [HttpGet("api/admin/total-public-profiles")]
        public async Task<ActionResult<int>> GetTotalPublicProfiles()
        {
            int totalPublicProfiles = await _context.ProfileInfo.CountAsync(p => p.ProfileStatus == "Public");
            return Ok(totalPublicProfiles);
        }

        [HttpGet("api/admin/total-comments")]
        public async Task<ActionResult<int>> GetTotalComments()
        {
            int totalComments = await _context.Comments.CountAsync();
            return Ok(totalComments);
        }
    }
}