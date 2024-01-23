using Microsoft.AspNetCore.Identity;
using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;
using WatchersWorld.Server.DTOs.Account;
using WatchersWorld.Server.Models.Authentication;
using WatchersWorld.Server.Services;

namespace WatchersWorld.Server.Controllers
{
    // Defines routing for the API controller, handling user account-related requests.
    [Microsoft.AspNetCore.Components.Route("api/[controller]")]
    [ApiController]
    public class AccountController : ControllerBase
    {
        // Service for generating JWT tokens.
        private readonly JWTService _jwtService;

        // Manager for authentication processes.
        private readonly SignInManager<User> _signInManager;

        // Manager for user-related operations.
        private readonly UserManager<User> _userManager;

        // Constructor for dependency injection.
        public AccountController(JWTService jWTService, SignInManager<User> signInManager, UserManager<User> userManager)
        {
            _jwtService = jWTService;
            _signInManager = signInManager;
            _userManager = userManager;
        }

        // Method to handle login requests.
        [HttpPost("login")]
        public async Task<ActionResult<UserDto>> Login(LoginDto model)
        {
            var user = await _userManager.FindByNameAsync(model.UserName);
            if (user == null) return Unauthorized("Invalid Username");
            if (!user.EmailConfirmed) return Unauthorized("Please confirm your email");

            var result = await _signInManager.CheckPasswordSignInAsync(user, model.Password, false);
            if (!result.Succeeded) return Unauthorized("Password Incorrect");

            return CreateApplicationUserDto(user);
        }

        // Method to handle registration requests.
        [HttpPost("register")]
        public async Task<IActionResult> Register(RegisterDto model)
        {
            if (await CheckEmailExistsAsync(model.Email))
            {
                return BadRequest($"An existing account is using {model.Email}, email address. Please try with another email address.");
            }

            var userToAdd = new User
            {
                UserName = model.Username.ToLower(),
                Email = model.Email.ToLower(),
                EmailConfirmed = true, 
            };

            var result = await _userManager.CreateAsync(userToAdd, model.Password);
            if (!result.Succeeded) return BadRequest(result.Errors);

            return Ok("Your account has been created, you can now login.");
        }

        #region Private Helper Methods
        // Creates a UserDto from user information.
        private UserDto CreateApplicationUserDto(User user)
        {
            return new UserDto
            {
                JWT = _jwtService.CreateJWT(user),
            };
        }

        // Checks if the email already exists in the database.
        private async Task<bool> CheckEmailExistsAsync(string email)
        {
            return await _userManager.Users.AnyAsync(x => x.Email == email.ToLower());
        }
        #endregion
    }
}
