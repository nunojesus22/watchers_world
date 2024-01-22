using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Cors;
using Microsoft.AspNetCore.Identity;
using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;
using WatchersWorld.Server.DTOs.Account;
using WatchersWorld.Server.Models.Authentication;
using WatchersWorld.Server.Services;

namespace WatchersWorld.Server.Controllers
{
    [Authorize]
    [Microsoft.AspNetCore.Components.Route("api/{controller}")]
    [ApiController]
    public class AccountController : ControllerBase
    {
        private readonly JWTService _jwtService;
        private readonly SignInManager<User> _signInManager;
        private readonly UserManager<User> _userManager;

        public AccountController(JWTService jWTService, SignInManager<User> signInManager, UserManager<User> userManager)
        {
            this._jwtService = jWTService;
            this._signInManager = signInManager;
            this._userManager = userManager;
        }

        [HttpPost("login")]
        public async Task<ActionResult<UserDto>> Login(LoginDto model)
        {
            var user = await _userManager.FindByNameAsync(model.UserName);
            if (user == null) return Unauthorized("Invalid Username");
            if (user.EmailConfirmed == false) return Unauthorized("Please confirm your email");

            var result = await _signInManager.CheckPasswordSignInAsync(user, model.Password, false);
            if (!result.Succeeded) return Unauthorized("Password Incorrect");

            return CreateApplicationUserDto(user);
        }

        [AllowAnonymous]
        [HttpPost("api/account/register")]
        public async Task<IActionResult> Register(RegisterDto model)
        {
            if (await CheckUsernameExistsAsync(model.Username))
            {
                var error = new {
                    Message = "Já existe um utilizador com esse nome de utilizador!",
                    Field = "Username"
                };

                return BadRequest(error);
            }

            if (await CheckEmailExistsAsync(model.Email))
            {
                var error = new
                {
                    Message = "Já existe uma conta associada a esse email!",
                    Field = "Email"
                };

                return BadRequest(error);
            }

            var userToAdd = new User
            {
                UserName = model.Username,
                Email = model.Email.ToLower(),
                EmailConfirmed = true,
            };

            var result = await _userManager.CreateAsync(userToAdd, model.Password);
            if (!result.Succeeded) return BadRequest(result.Errors);
            return Ok(new JsonResult(new {title="Account Created", message="A tua conta foi criada com sucesso!"}));
        }

        #region Private Help Methods
        private UserDto CreateApplicationUserDto(User user)
        {
            return new UserDto
            {
                JWT = _jwtService.CreateJWT(user),
            };
        }

        private async Task<bool> CheckEmailExistsAsync(string email)
        {
            return await _userManager.Users.AnyAsync(x => x.Email == email.ToLower());
        }

        private async Task<bool> CheckUsernameExistsAsync(string username)
        {
            return await _userManager.Users.AnyAsync(x => x.UserName == username);
        }
        #endregion
    }
}
