using Google.Apis.Auth;
using Mailjet.Client.TransactionalEmails;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Identity;
using Microsoft.AspNetCore.Mvc;
using Microsoft.AspNetCore.WebUtilities;
using Microsoft.EntityFrameworkCore;
using NuGet.Versioning;
using System.Security.Claims;
using System.Text;
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
        private readonly EmailService _emailService;
        private readonly IConfiguration _config;

        // Constructor for dependency injection.
        public AccountController(JWTService jWTService, SignInManager<User> signInManager, UserManager<User> userManager, EmailService emailService, IConfiguration config)
        {
            _jwtService = jWTService;
            _signInManager = signInManager;
            _userManager = userManager;
            _emailService = emailService;
            _config = config;
        }

        [Authorize]
        [HttpGet("api/account/refresh-user-token")]
        public async Task<ActionResult<UserDto>> RefreshUserToken()
        {
            var user = await _userManager.FindByEmailAsync(User.FindFirst(ClaimTypes.Email)?.Value);
            return CreateApplicationUserDto(user);
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

            if (await CheckProviderAsync(model.Email, "google"))
            {
                return BadRequest(new { Message = "Email associado a uma conta google!", Field = "Email" });
            }

            var user = await _signInManager.UserManager.FindByEmailAsync(model.Email);
            if (user == null)
            {
                return BadRequest(new { Message = "Não existe nenhuma conta associada a esse email!", Field = "Email" });
            }

            if (!await _signInManager.UserManager.IsEmailConfirmedAsync(user))
            {
                return Ok(new { message = "A conta está por confirmar!", Field = "EmailPorConfirmar", user = CreateApplicationUserDto(user) });
            }

            var passwordCheck = await _signInManager.CheckPasswordSignInAsync(user, model.Password, lockoutOnFailure: false);
            if (!passwordCheck.Succeeded)
            {
                return BadRequest(new { Message = "A password está incorreta.", Field = "Password" });
            }

            if (!passwordCheck.Succeeded) return BadRequest(new { Message = "A password está incorreta.", Field = "Password" });

            return Ok ( new { user = CreateApplicationUserDto(user) });
        }
        [AllowAnonymous]
        [HttpPost("api/account/login-with-third-party")]
        public async Task<ActionResult<UserDto>> LoginWithThirdParty(LoginWithExternalDto model)
        {
            if (model.Provider.Equals(SD.Google))
            {
                try
                {

                    if (!GoogleValidatedAsync(model.AccessToken, model.UserId).GetAwaiter().GetResult())

                    {
                        return Unauthorized("Unable to login with google");
                    }
                }
                catch (Exception)
                {
                    return Unauthorized("Unable to Login with google");
                }

            }
            else
            {
                return BadRequest("Invalid PRovider");
            }

            if (await CheckProviderAsync(model.Email, "Credentials"))
            {
                return BadRequest(new { Message = "Email associado a uma conta com email e password!", Field = "ThirdPartyEmail" });
            }

            var user = await _signInManager.UserManager.FindByEmailAsync(model.Email);
            if (user == null)
            {
                return BadRequest(new { Message = "Não existe nenhuma conta associada a esse email!", Field = "ThirdPartyEmail" });
            }

            user = await _signInManager.UserManager.FindByEmailAsync(model.Email);

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

            if (await CheckProviderAsync(model.Email, "google"))
            {
                return BadRequest(new { Message = "Email associado a uma conta google!", Field = "Email" });
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
                Provider = "Credentials"
            };

            var result = await _userManager.CreateAsync(userToAdd, model.Password);
            if (!result.Succeeded) return BadRequest(result.Errors);
           
            try
            {
                if(await SendConfirmEmailAsync(userToAdd))
                {
                    return Ok(new JsonResult(new { title = "Account Created", message = "A tua conta foi criada com sucesso! Confirma o teu email." }));
                }

                return BadRequest("Failed to send email. Please contact admin");
            }
            catch (Exception)
            {
                return BadRequest("Failed to send email. Please contact admin");
            }
        }


        [HttpPost("/api/account/register-with-third-party")]
        public async Task<ActionResult<UserDto>> RegisterWithThirdParty(RegisterWithExternalDto model)
        {
            if (model.Provider.Equals(SD.Google))
            {
                try
                {

                    if (!GoogleValidatedAsync(model.AccessToken, model.UserId).GetAwaiter().GetResult())
                    {
                        return Unauthorized("Unable to register with google");
                    }
                }
                catch (Exception)
                {
                    return Unauthorized("Unable to Register with google");
                }

            }
            else
            {
                return BadRequest("Invalid Provider");
            }

            if (await CheckEmailExistsAsync(model.Email))
            {
                return BadRequest(new { Message = "Já existe uma conta associada a esse email. Volte atrás e escolha outro email!", Field = "ThirdPartyEmail" });
            }

            var userToAdd = new User
            {
                UserName = model.Username.ToLower(),
                EmailConfirmed = false,
                Provider = model.Provider,
                Email = model.Email.ToLower(),
            };

            var result = await _userManager.CreateAsync(userToAdd);
            if (!result.Succeeded) return BadRequest(result.Errors);

            return CreateApplicationUserDto(userToAdd);
        }

        [HttpPut("api/account/confirm-email")]
        public async Task<IActionResult> ConfirmEmail(ConfirmEmailDto model)
        {
            var user = await _userManager.FindByEmailAsync(model.Email);
            if (user == null) return Unauthorized(new { Message = "Não existe nenhuma conta associada a esse email!", Field = "Email" });

            if (user.EmailConfirmed) return BadRequest( new { Message = "O email já foi confirmado anteriormente!", Field = "Email" });

            try
            {
                var decodedTokenBytes = WebEncoders.Base64UrlDecode(model.Token);
                var decodedToken = Encoding.UTF8.GetString(decodedTokenBytes);

                var result = await _userManager.ConfirmEmailAsync(user, decodedToken);
                if(!result.Succeeded)
                {
                    return Ok(new JsonResult(new { title = "Email Confirmed", message = "O teu email foi confirmado com sucesso! Consegues dar login agora." }));
                }
                return BadRequest(new { Message = "Token Inválido. Tente novamente.", Field = "Email" });

            } 
            catch (Exception)
            {
                return BadRequest(new { Message = "Token Inválido. Tente novamente.", Field = "Email" });
            }
        }

        [HttpPost("api/account/resend-email-confirmation-link/{email}")]
        public async Task<IActionResult> ResendEmailConfirmationLink(string email)
        {
            if (string.IsNullOrEmpty(email)) return BadRequest("Invalid email");
            var user = await _userManager.FindByEmailAsync(email);
            if (user == null) return Unauthorized(new { Message = "Não existe nenhuma conta associada a esse email!", Field = "Email" });

            if (user.EmailConfirmed) return BadRequest(new { Message = "O email já foi confirmado anteriormente!", Field = "Email" });

            try
            {
                if(await SendConfirmEmailAsync(user))
                {
                    return Ok(new JsonResult(new { title = "Confirmation link sent", message = "Confirma o teu email." }));
                }
                return BadRequest("Failed to send email. Please contact admin");
            }
            catch
            {
                return BadRequest("Failed to send email. Please contact admin");
            }
        }


        [HttpPost("api/account/forgot-password/{email}")]
        public async Task<IActionResult> ForgotPassword(string email)
        {
            if (string.IsNullOrEmpty(email)) return BadRequest("Invalid email");
            var user = await _userManager.FindByEmailAsync(email);
            if (user == null) return Unauthorized(new { Message = "Não existe nenhuma conta associada a esse email!", Field = "Email" });
            if (!user.EmailConfirmed) return BadRequest(new { Message = "O email tem de ser confirmado primeiro!", Field = "Email" });
            try
            {
                if (await SendForgotPasswordEmail(user))
                {
                    return Ok(new JsonResult(new { title = "Confirmation link sent", message = "Confirma o teu email." }));
                }
                return BadRequest("Failed to send email. Please contact admin");
            }
            catch
            {
                return BadRequest("Failed to send email. Please contact admin");
            }
        }

        [HttpPut("api/account/reset-password")]
        public async Task<IActionResult> ResetPassword(ResetPasswordDto model)
        {
            var user = await _userManager.FindByEmailAsync(model.Email);
            if (user == null) return Unauthorized(new { Message = "Não existe nenhuma conta associada a esse email!", Field = "Email" });
            if (!user.EmailConfirmed) return BadRequest(new { Message = "O email tem de ser confirmado primeiro!", Field = "Email" });
            try
            {
                var decodedTokenBytes = WebEncoders.Base64UrlDecode(model.Token);
                var decodedToken = Encoding.UTF8.GetString(decodedTokenBytes);

                var result = await _userManager.ResetPasswordAsync(user, decodedToken, model.NewPassword);
                if (!result.Succeeded)
                {
                    return Ok(new JsonResult(new { title = "Nova password confirmada", message = "A tua password foi alterada com sucesso! Consegues dar login agora." }));
                }
                return BadRequest(new { Message = "Token Inválido. Tente novamente.", Field = "Email" });
            }
            catch
            {
                return BadRequest(new { Message = "Token Inválido. Tente novamente.", Field = "Email" });
            }
        }

        private async Task<bool> GoogleValidatedAsync(string accessToken, string userId)
        {

            var payload = await GoogleJsonWebSignature.ValidateAsync(accessToken);
            if (!payload.Audience.Equals(_config["Google:ClientId"]))
            {
                return false;
            }

            if (!payload.Issuer.Equals("accounts.google.com") && !payload.Issuer.Equals("https://accounts.google.com"))
                return false;

            if (payload.ExpirationTimeSeconds == null)
                return false;

            DateTime now = DateTime.Now.ToUniversalTime();
            DateTime expiration = DateTimeOffset.FromUnixTimeSeconds((long)payload.ExpirationTimeSeconds).DateTime;

            if (now > expiration) return false;


            if (!payload.Subject.Equals(userId)) return false;

            return true;

        }


        #region Private Helper Methods
        // Creates a UserDto from user information.
        private UserDto CreateApplicationUserDto(User user)
        {
            return new UserDto
            {
                Username = user.UserName,
                Email = user.Email,
                JWT = _jwtService.CreateJWT(user),
            };
        }

        private async Task<bool> CheckProviderAsync(string email, string provider)
        {
            return await _userManager.Users.AnyAsync(u => u.Email == email && u.Provider.Equals(provider));
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

        private async Task<bool> SendConfirmEmailAsync(User user)
        {
            var token = await _userManager.GenerateEmailConfirmationTokenAsync(user);
            token = WebEncoders.Base64UrlEncode(Encoding.UTF8.GetBytes(token));
            var url = $"{_config["JWT:ClientUrl"]}/{_config["Email:ConfirmEmailPath"]}?token={token}&email={user.Email}";


            var body = $"<p>Hello: {user.UserName}</p>" +
                        "<p>Please confirm your email address by clicking on the following link.</p>" + $"<p><a href=\"{url}\">Click here</a></p>" +
                        "<p>Thank you,</p>" +
                        $"<br>{_config["Email: ApplicationName"]}";

            var emailSend = new EmailSendDto(user.Email, "Confirm your email", body);
            return await _emailService.SendEmailAsync(emailSend);
        }

        private async Task<bool> SendForgotPasswordEmail(User user)
        {
            var token = await _userManager.GeneratePasswordResetTokenAsync(user);
            token = WebEncoders.Base64UrlEncode(Encoding.UTF8.GetBytes(token));
            var url = $"{_config["JWT:ClientUrl"]}/{_config["Email:ResetPasswordPath"]}?token={token}&email={user.Email}";


            var body = $"<p>Hello: {user.UserName}</p>" +
                        "<p>In order to reset your password, click on the following link.</p>" + $"<p><a href=\"{url}\">Click here</a></p>" +
                        "<p>Thank you,</p>" +
                        $"<br>{_config["Email: ApplicationName"]}";

            var emailSend = new EmailSendDto(user.Email, "Reset your password", body);
            return await _emailService.SendEmailAsync(emailSend);
        }
        #endregion
    }


}
