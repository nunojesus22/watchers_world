using Microsoft.AspNetCore.Authorization;
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

        [AllowAnonymous]
        [HttpPost("api/account/login")]
        public async Task<ActionResult<UserDto>> Login(LoginDto model)
        {
            if (!ModelState.IsValid)
            {
                var errors = ModelState
                    .Where(x => x.Value.Errors.Any())
                    .Select(kvp => new {
                        Field = kvp.Key,
                        Message = kvp.Value.Errors.First().ErrorMessage
                    }).ToList();

                return BadRequest(new { Errors = errors });
            }

            var user = await _signInManager.UserManager.FindByEmailAsync(model.Email);
            if (user == null)
            {
                return BadRequest(new { Message = "Não existe nenhuma conta associada a esse email!", Field = "Email" });
            }

            var passwordCheck = await _signInManager.CheckPasswordSignInAsync(user, model.Password, lockoutOnFailure: false);
            if (!passwordCheck.Succeeded)
            {
                return BadRequest(new { Message = "A password está incorreta.", Field = "Password" });
            }

            if (!await _signInManager.UserManager.IsEmailConfirmedAsync(user))
            {
                return BadRequest(new { Message = "A conta está por confirmar!", Field = "EmailPorConfirmar" });
            }

            if (!passwordCheck.Succeeded) return BadRequest(new { Message = "A password está incorreta.", Field = "Password" });

            return CreateApplicationUserDto(user);
        }

        // Method to handle registration requests.
        [AllowAnonymous]
        [HttpPost("api/account/register")]
        public async Task<IActionResult> Register(RegisterDto model)
        {
            if (!ModelState.IsValid)
            {
                var errors = ModelState
                    .Where(x => x.Value.Errors.Any())
                    .Select(kvp => new {
                        Field = kvp.Key,
                        Message = kvp.Value.Errors.First().ErrorMessage
                    }).ToList();

                return BadRequest(new { Errors = errors });
            }

            if (await CheckUsernameExistsAsync(model.Username))
            {
                return BadRequest(new { Message = "Já existe um utilizador com esse nome de utilizador!", Field = "Username" });
            }

            if (await CheckEmailExistsAsync(model.Email))
            {
                return BadRequest(new { Message = "Já existe uma conta associada a esse email!", Field = "Email" });
            }

            var userToAdd = new User
            {
                UserName = model.Username,
                Email = model.Email.ToLower(),
                EmailConfirmed = true,
            };

            var result = await _userManager.CreateAsync(userToAdd, model.Password);
            if (!result.Succeeded) return BadRequest(result.Errors);
            return Ok(new JsonResult(new { title = "Account Created", message = "A tua conta foi criada com sucesso!" }));
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

        // Checks if the username already exists in the database.
        private async Task<bool> CheckUsernameExistsAsync(string username)
        {
            return await _userManager.Users.AnyAsync(x => x.UserName == username.ToLower());
        }
        #endregion
    }
}
