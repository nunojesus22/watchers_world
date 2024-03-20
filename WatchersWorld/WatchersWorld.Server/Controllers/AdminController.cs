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


        // Service for generating JWT tokens.
        private readonly JWTService _jwtService;

        // Manager for authentication processes.
        private readonly SignInManager<User> _signInManager;

        // Manager for user-related operations.
        private readonly UserManager<User> _userManager;
        private readonly EmailService _emailService;
        private readonly IConfiguration _config;

        private readonly ILogger<AccountController> _logger;


        private WatchersWorldServerContext _context;

        // Constructor for dependency injection.
        public AdminController(JWTService jWTService, SignInManager<User> signInManager, UserManager<User> userManager, EmailService emailService, IConfiguration config, WatchersWorldServerContext context, ILogger<AccountController> logger)
        /// <summary>
        /// Constructor for AccountController.
        /// </summary>
        /// <param name="jWTService">Service for generating JWT tokens.</param>
        /// <param name="signInManager">Manager for handling sign-in processes.</param>
        /// <param name="userManager">Manager for user-related operations.</param>
        /// <param name="emailService">Service for handling email operations.</param>
        /// <param name="config">Application configuration settings.</param>
        {
            _jwtService = jWTService;
            _signInManager = signInManager;
            _userManager = userManager;
            _emailService = emailService;
            _config = config;
            _context = context;
            _logger = logger;

        }



        [HttpGet("api/admin/getUserRole/{username}")]
        public async Task<ActionResult<string[]>> GetUserRole(string username)
        {
            var user = await _userManager.FindByNameAsync(username);
            if (user == null)
            {
                return NotFound("User not found");
            }

            var roles = await _userManager.GetRolesAsync(user);
            return Ok(roles.ToArray());
        }


        [HttpPost("api/admin/ban-user-permanently/{username}")]
        //[Authorize(Roles = "Admin")] // Ensure only admins can perform this action
        public async Task<IActionResult> BanUserPermanently(string username)
        {
            var user = await _userManager.FindByNameAsync(username);
            if (user == null)
            {
                return NotFound("User not found.");
            }

            // Retrieve the user's profile info
            var profileInfo = await _context.ProfileInfo.FirstOrDefaultAsync(p => p.UserName == username);
            if (profileInfo == null)
            {
                return NotFound("User profile info not found.");
            }

            // Set ban-related properties in the profile info DTO
            profileInfo.StartBanDate = DateTime.UtcNow; // Set the start ban date
            profileInfo.EndBanDate = DateTime.MaxValue; // Set the end ban date to a large value, indicating permanent ban
            profileInfo.IsBanned = true;

            // Update the user's profile info in the database
            _context.ProfileInfo.Update(profileInfo);
            await _context.SaveChangesAsync();

            return Ok(new { message = "User banned permanently." });
        }

        [HttpPost("api/admin/ban-user-temporarily/{username}")]
        //[Authorize(Roles = "Admin")] // Ensure only admins can perform this action
        public async Task<IActionResult> BanUserTemporarily(string username, [FromQuery] int banDurationInDays)
        {
            var user = await _userManager.FindByNameAsync(username);
            if (user == null)
            {
                return NotFound("User not found.");
            }

            var profileInfo = await _context.ProfileInfo.FirstOrDefaultAsync(p => p.UserName == username);
            if (profileInfo == null)
            {
                return NotFound("User profile info not found.");
            }

            profileInfo.StartBanDate = DateTime.UtcNow;
            profileInfo.EndBanDate = DateTime.UtcNow.AddDays(banDurationInDays);
            profileInfo.IsBanned = banDurationInDays > 0;

            _context.ProfileInfo.Update(profileInfo);
            await _context.SaveChangesAsync();

            var response = new { message = $"User banned temporarily for {banDurationInDays} days." };
            return Ok(response);
        }



        [HttpDelete("api/admin/users/{username}")]
        //[Authorize(Roles = "Admin")] // Ensuring that only authorized users can perform this action
        public async Task<IActionResult> DeleteUserByUsername(string username)
        {
            // Start a transaction
            using (var transaction = _context.Database.BeginTransaction())
            {
                try
                {
                    // Find the user's profile info
                    var profileInfo = await _context.ProfileInfo.FirstOrDefaultAsync(p => p.UserName == username);
                    if (profileInfo != null)
                    {
                        // Delete the profile info
                        _context.ProfileInfo.Remove(profileInfo);
                        await _context.SaveChangesAsync();
                    }

                    // Find the user by username
                    var user = await _userManager.FindByNameAsync(username);
                    if (user == null)
                    {
                        return NotFound("User not found.");
                    }

                    // Delete the user
                    var result = await _userManager.DeleteAsync(user);
                    if (!result.Succeeded)
                    {
                        // If the user wasn't deleted successfully, return the errors
                        return BadRequest(result.Errors);
                    }

                    // Commit the transaction
                    await transaction.CommitAsync();

                    return Ok("User and profile info successfully deleted.");
                }
                catch (Exception ex)
                {
                    // If there was an exception, rollback the transaction
                    await transaction.RollbackAsync();

                    // Log the exception and return a generic error message
                    _logger.LogError(ex, "An error occurred while deleting user and profile info.");
                    return StatusCode(500, "An error occurred while deleting the user and profile info.");
                }
            }
        }

        [HttpPut("api/admin/unban-user/{username}")]
        //[Authorize(Roles = "Admin")] // Ensure only admins can perform this action
        public async Task<IActionResult> UnbanUser(string username)
        {
            var user = await _userManager.FindByNameAsync(username);
            if (user == null)
            {
                return NotFound("User not found.");
            }

            var profileInfo = await _context.ProfileInfo.FirstOrDefaultAsync(p => p.UserName == username);
            if (profileInfo == null)
            {
                return NotFound("User profile info not found.");
            }

            // Reset ban-related properties
            profileInfo.StartBanDate = null;
            profileInfo.EndBanDate = null;
            profileInfo.IsBanned = false; // Assuming you have a Banned flag

            // Update the user's profile info in the database
            _context.ProfileInfo.Update(profileInfo);
            await _context.SaveChangesAsync();

            return Ok(new { message = "User unbanned successfully." });

        }



        [HttpPut("api/admin/change-role-to-moderator/{username}")]
        public async Task<IActionResult> ChangeRoleToModerator(string username)
        {
            var user = await _userManager.FindByNameAsync(username);
            if (user == null)
            {
                return NotFound("User not found.");
            }

            var currentRoles = await _userManager.GetRolesAsync(user);
            var removeResult = await _userManager.RemoveFromRolesAsync(user, currentRoles);

            if (!removeResult.Succeeded)
            {
                return BadRequest("Failed to remove existing roles.");
            }

            var addResult = await _userManager.AddToRoleAsync(user, "Moderator");
            if (!addResult.Succeeded)
            {
                // Optionally, you might want to rollback removing the roles if adding the new role fails
                return BadRequest("Failed to add user to moderator role.");
            }

            return Ok("User role updated to Moderator successfully.");
        }




    }
}