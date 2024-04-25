using Google.Apis.Auth;
using Mailjet.Client.Resources;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Identity;
using Microsoft.AspNetCore.Mvc;
using Microsoft.AspNetCore.WebUtilities;
using Microsoft.EntityFrameworkCore;
using System.Security.Claims;
using System.Text;
using WatchersWorld.Server.Data;
using WatchersWorld.Server.DTOs.Account;
using WatchersWorld.Server.Models.Authentication;
using WatchersWorld.Server.Services;
using static System.Runtime.InteropServices.JavaScript.JSType;
using User = WatchersWorld.Server.Models.Authentication.User;

namespace WatchersWorld.Server.Controllers
{
    /// <summary>
    /// Controlador responsável por tratar das solicitações relacionadas com contas de utilizador, como autenticação, registo, confirmação de email e gestão de senha.
    /// </summary>
    /// <remarks>
    /// Construtor para injeção de dependências.
    /// </remarks>
    /// <param name="jWTService">Service for generating JWT tokens.</param>
    /// <param name="signInManager">Manager for handling sign-in processes.</param>
    /// <param name="userManager">Manager for user-related operations.</param>
    /// <param name="emailService">Service for handling email operations.</param>
    /// <param name="config">Application configuration settings.</param>
    [Microsoft.AspNetCore.Components.Route("api/[controller]")]
    [ApiController]
    public class AccountController(JWTService jWTService, SignInManager<User> signInManager, UserManager<User> userManager, EmailService emailService, IConfiguration config, WatchersWorldServerContext context, ILogger<AccountController> logger, IGamificationService gamificationService, INotificationService notificationService) : ControllerBase
    {
        // Service for generating JWT tokens.
        private readonly JWTService _jwtService = jWTService;

        // Manager for authentication processes.
        private readonly SignInManager<User> _signInManager = signInManager;

        // Manager for user-related operations.
        private readonly UserManager<User> _userManager = userManager;
        private readonly EmailService _emailService = emailService;
        private readonly IConfiguration _config = config;

        private readonly ILogger<AccountController> _logger = logger;


        private readonly WatchersWorldServerContext _context = context;

        private readonly IGamificationService _gamificationService = gamificationService;
        private readonly INotificationService _notificationService = notificationService;

        /// <summary>
        /// Renova o token de um utilizador autenticado.
        /// </summary>
        /// <returns>Um novo UserDto com o token renovado.</returns>
        [Authorize]
        [HttpGet("api/account/refresh-user-token")]
        public async Task<ActionResult<UserDto>> RefreshUserToken()
        {
            var user = await _userManager.FindByEmailAsync(User.FindFirst(ClaimTypes.Email)?.Value);
            return CreateApplicationUserDto(user);
        }

        /// <summary>
        /// Processa o login de um utilizador.
        /// </summary>
        /// <param name="model">DTO de Login contendo as credenciais do utilizador.</param>
        /// <returns>UserDto em caso de login bem-sucedido; caso contrário, retorna um erro.</returns>
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

            // Check if the user is currently banned
            var profileInfo = await _context.ProfileInfo.FirstOrDefaultAsync(pi => pi.UserId == user.Id);

            if (profileInfo != null)
            {
                var now = DateTime.UtcNow;
                if (profileInfo.StartBanDate.HasValue && profileInfo.EndBanDate.HasValue &&
                    now >= profileInfo.StartBanDate.Value && now <= profileInfo.EndBanDate.Value)
                {
                    var banDuration = profileInfo.EndBanDate.Value - now; // Changed to show remaining ban time
                    return BadRequest(new
                    {
                        Message = "This account is currently suspended.",
                        Field = "Banned",
                        BanDuration = banDuration // You might want to format it properly
                    });
                }
            }

            var passwordCheck = await _signInManager.CheckPasswordSignInAsync(user, model.Password, lockoutOnFailure: false);
            if (!passwordCheck.Succeeded)
            {
                return BadRequest(new { Message = "A password está incorreta.", Field = "Password" });
            }

            return Ok(new { user = CreateApplicationUserDto(user) });
        }

        /// <summary>
        /// Processa o login de um utilizador através de um serviço externo (ex: Google).
        /// </summary>
        /// <param name="model">DTO contendo informações do login externo.</param>
        /// <returns>UserDto em caso de sucesso.</returns>

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
                return BadRequest("Invalid Provider");
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

            // Check if the user is currently banned
            var profileInfo = await _context.ProfileInfo.FirstOrDefaultAsync(pi => pi.UserId == user.Id);

            if (profileInfo != null)
            {
                var now = DateTime.UtcNow;
                if (profileInfo.StartBanDate.HasValue && profileInfo.EndBanDate.HasValue &&
                    now >= profileInfo.StartBanDate.Value && now <= profileInfo.EndBanDate.Value)
                {
                    var banDuration = profileInfo.EndBanDate.Value - now; // Changed to show remaining ban time
                    return BadRequest(new
                    {
                        Message = "This account is currently suspended.",
                        Field = "Banned",
                        BanDuration = banDuration // You might want to format it properly
                    });
                }
            }

            user = await _signInManager.UserManager.FindByEmailAsync(model.Email);

            return CreateApplicationUserDto(user);

        }

        /// <summary>
        /// Trata do processo de registo de um novo utilizador.
        /// </summary>
        /// <param name="model">DTO de Registo contendo detalhes do novo utilizador.</param>
        /// <returns>ActionResult indicando o resultado do processo de registo.</returns>
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
                Email = model.Email,
                Provider = "Credentials"
            };

            var result = await _userManager.CreateAsync(userToAdd, model.Password);
            if (!result.Succeeded) return BadRequest(result.Errors);

            var user = await _userManager.FindByNameAsync(model.Username);

            var profileInfoToAdd = new ProfileInfo
            {
                UserId = user.Id,
                UserName = model.Username,
                Description = "Por definir!",
                Gender = 'M',
                BirthDate = DateTime.Now,
                ProfileStatus = "Public",
                ProfilePhoto = "assets/img/joao-pfp.png",
                CoverPhoto = "assets/img/pfp2.png",
                Following = 0,
                Followers = 0
            };

            if (result.Succeeded)
            {
                await _userManager.AddToRoleAsync(userToAdd, "user");

                try
                {
                    bool medalAwarded = await _gamificationService.AwardMedalAsync(userToAdd.UserName, "Conta Criada");
                    if (medalAwarded)
                    {
                        await _notificationService.CreateAchievementNotificationAsync(userToAdd.Id, 1);

                    }
                    else
                    {
                        // Handle the case where the medal is not awarded, if necessary
                        _logger.LogWarning("Medal was not awarded for user {UserName}.", userToAdd.UserName);
                    }

                }
                catch (Exception ex)
                {
                    _logger.LogError(ex, "An error occurred while awarding a medal to user {UserName}.", userToAdd.UserName);
                }
            }

            _context.ProfileInfo.Add(profileInfoToAdd);
            await _context.SaveChangesAsync();

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
                if (!await GoogleValidatedAsync(model.AccessToken, model.UserId))
                {
                    return Unauthorized("Unable to register with Google.");
                }
            }
            else
            {
                return BadRequest("Invalid Provider");
            }

            // Verificar se o email já está em uso
            if (await CheckEmailExistsAsync(model.Email))
            {
                return BadRequest(new { Message = "Email already associated with an account. Please use a different email!", Field = "Email" });
            }

            var userToAdd = new User
            {
                UserName = model.Username,
                EmailConfirmed = true,
                Provider = model.Provider,
                Email = model.Email,
            };

            var result = await _userManager.CreateAsync(userToAdd);
            if (!result.Succeeded)
            {
                return BadRequest(result.Errors);
            }

            await _userManager.AddToRoleAsync(userToAdd, "user");

            var profileInfoToAdd = new ProfileInfo
            {
                UserId = userToAdd.Id, 
                UserName = model.Username,
                Description = "Por definir!",
                Gender = 'M',
                BirthDate = DateTime.Now,
                ProfileStatus = "Public",
                ProfilePhoto = "assets/img/joao-pfp.png",
                CoverPhoto = "assets/img/pfp2.png",
                Following = 0,
                Followers = 0
            };

            _context.ProfileInfo.Add(profileInfoToAdd);
            await _context.SaveChangesAsync();

            try
            {
                bool medalAwarded = await _gamificationService.AwardMedalAsync(userToAdd.UserName, "Conta Criada");
                if (medalAwarded)
                {
                    await _notificationService.CreateAchievementNotificationAsync(userToAdd.Id, 1);

                }
                else
                {
                    // Handle the case where the medal is not awarded, if necessary
                    _logger.LogWarning("Medal was not awarded for user {UserName}.", userToAdd.UserName);
                }

            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "An error occurred while awarding a medal or creating a notification for user {UserName}.", userToAdd.UserName);
                // Pode optar por retornar uma resposta indicando falha ou simplesmente registrar o erro e continuar
            }

            // Retornar o DTO do utilizador criado
            return CreateApplicationUserDto(userToAdd);
        }


        /// <summary>
        /// Confirma o endereço de email de um utilizador.
        /// </summary>
        /// <param name="model">DTO contendo o email e o token de confirmação.</param>
        /// <returns>ActionResult indicando o resultado do processo de confirmação do email.</returns>
        [HttpPut("api/account/confirm-email")]
        public async Task<IActionResult> ConfirmEmail(ConfirmEmailDto model)
        {
            var user = await _userManager.FindByEmailAsync(model.Email);
            if (user == null) return BadRequest(new { Message = "Não existe nenhuma conta associada a esse email!", Field = "Email" });

            if (user.EmailConfirmed) return BadRequest( new { Message = "O email já foi confirmado anteriormente!", Field = "Email" });

            try
            {
                var decodedTokenBytes = WebEncoders.Base64UrlDecode(model.Token);
                var decodedToken = Encoding.UTF8.GetString(decodedTokenBytes);

                var result = await _userManager.ConfirmEmailAsync(user, decodedToken);
                if(result.Succeeded)
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

        /// <summary>
        /// Reenvia o link de confirmação de email para um utilizador.
        /// </summary>
        /// <param name="email">Endereço de email do utilizador.</param>
        /// <returns>ActionResult indicando o resultado da operação de reenvio.</returns>
        [HttpPost("api/account/resend-email-confirmation-link/{email}")]
        public async Task<IActionResult> ResendEmailConfirmationLink(string email)
        {
            if (string.IsNullOrEmpty(email)) return BadRequest("Invalid email");
            var user = await _userManager.FindByEmailAsync(email);
            if (user == null) return BadRequest(new { Message = "Não existe nenhuma conta associada a esse email!", Field = "Email" });

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

        /// <summary>
        /// Trata o processo de redefinição de senha para um utilizador que esqueceu a sua senha.
        /// </summary>
        /// <param name="email">Endereço de email do utilizador.</param>
        /// <returns>ActionResult indicando o resultado do processo de esquecimento de senha.</returns>
        [HttpPost("api/account/forgot-password/{email}")]
        public async Task<IActionResult> ForgotPassword(string email)
        {
            if (string.IsNullOrEmpty(email)) return BadRequest("Invalid email");
            var user = await _userManager.FindByEmailAsync(email);
            if (user == null) return BadRequest(new { Message = "Não existe nenhuma conta associada a esse email!", Field = "Email" });
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

        /// <summary>
        /// Redefine a senha de um utilizador.
        /// </summary>
        /// <param name="model">DTO contendo detalhes da nova senha e token.</param>
        /// <returns>ActionResult indicando o resultado do processo de redefinição de senha.</returns>
        [HttpPut("api/account/reset-password")]
        public async Task<IActionResult> ResetPassword(ResetPasswordDto model)
        {
            var user = await _userManager.FindByEmailAsync(model.Email);
            if (user == null) return BadRequest(new { Message = "Não existe nenhuma conta associada a esse email!", Field = "Password" });
            if (!user.EmailConfirmed) return BadRequest(new { Message = "O email tem de ser confirmado primeiro!", Field = "Password" });
            try
            {
                var decodedTokenBytes = WebEncoders.Base64UrlDecode(model.Token);
                var decodedToken = Encoding.UTF8.GetString(decodedTokenBytes);

                var result = await _userManager.ResetPasswordAsync(user, decodedToken, model.NewPassword);
                if (result.Succeeded)
                {
                    return Ok(new JsonResult(new { title = "Nova password confirmada", message = "A tua password foi alterada com sucesso! Consegues dar login agora." }));
                }
                return BadRequest(new { Message = "Token Inválido. Tente novamente.", Field = "Password" });
            }
            catch
            {
                return BadRequest(new { Message = "Token Inválido. Tente novamente.", Field = "Password" });
            }
        }


        /// <summary>
        /// Obtém os papéis de um utilizador.
        /// </summary>
        /// <param name="username">Nome de utilizador do qual obter os papéis.</param>
        /// <returns>ActionResult com os papéis do utilizador.</returns>
        [HttpGet("api/account/getUserRole/{username}")]
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

        /// <summary>
        /// Elimina um utilizador e a sua informação de perfil pelo seu nome de utilizador.
        /// </summary>
        /// <param name="username">Nome de utilizador do utilizador a eliminar.</param>
        /// <returns>ActionResult indicando o resultado do processo de eliminação.</returns>
        [HttpDelete("api/users/{username}")]
        //[Authorize(Roles = "Admin")] // Ensuring that only authorized users can perform this action
        public async Task<IActionResult> DeleteUserByUsername(string username)
        {
            // Start a transaction
            using var transaction = _context.Database.BeginTransaction();
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

        /// <summary>
        /// Bane um utilizador de forma permanente.
        /// </summary>
        /// <param name="username">Nome de utilizador do utilizador a banir.</param>
        /// <returns>ActionResult indicando o resultado do processo de banimento.</returns>
        [HttpPost("api/account/ban-user-permanently/{username}")]
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

            // Update the user's profile info in the database
            _context.ProfileInfo.Update(profileInfo);
            await _context.SaveChangesAsync();

            return Ok("User banned permanently.");
        }

        /// <summary>
        /// Bane um utilizador temporariamente.
        /// </summary>
        /// <param name="username">Nome de utilizador do utilizador a banir.</param>
        /// <param name="banDurationInDays">Duração do banimento em dias.</param>
        /// <returns>ActionResult indicando o resultado do processo de banimento temporário.</returns>
        [HttpPost("api/account/ban-user-temporarily/{username}")]
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

            _context.ProfileInfo.Update(profileInfo);
            await _context.SaveChangesAsync();

            return Ok($"User banned temporarily for {banDurationInDays} days.");
        }

        /// <summary>
        /// Valida o token de acesso do Google e verifica se o userId corresponde ao esperado.
        /// </summary>
        /// <param name="accessToken">Token de acesso fornecido pelo Google.</param>
        /// <param name="userId">UserId do Google para validar.</param>
        /// <returns>True se a validação for bem-sucedida; False caso contrário.</returns>
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
        /// <summary>
        /// Creates a UserDto from the provided user information.
        /// </summary>
        /// <param name="user">User object containing the user's information.</param>
        /// <returns>A UserDto object containing username, email, and JWT token.</returns>
        private UserDto CreateApplicationUserDto(User user)
        {
            if (user == null) return null;
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

        
        /// <summary>
        /// Asynchronously checks if the provided email already exists in the database.
        /// </summary>
        /// <param name="email">Email address to check.</param>
        /// <returns>True if the email exists, otherwise false.</returns>
        private async Task<bool> CheckEmailExistsAsync(string email)
        {
            return await _userManager.Users.AnyAsync(x => x.Email == email );
        }

        /// <summary>
        /// Asynchronously checks if the provided username already exists in the database.
        /// </summary>
        /// <param name="username">Username to check.</param>
        /// <returns>True if the username exists, otherwise false.</returns>
        private async Task<bool> CheckUsernameExistsAsync(string username)
        {
            return await _userManager.Users.AnyAsync(x => x.UserName == username);
        }

        /// <summary>
        /// Sends an email for account confirmation to the user.
        /// </summary>
        /// <param name="user">User object to whom the confirmation email will be sent.</param>
        /// <returns>True if the email was sent successfully, otherwise false.</returns>
        private async Task<bool> SendConfirmEmailAsync(User user)
        {
            var token = await _userManager.GenerateEmailConfirmationTokenAsync(user);
            token = WebEncoders.Base64UrlEncode(Encoding.UTF8.GetBytes(token));
            var url = $"{_config["JWT:ClientUrl"]}/{_config["Email:ConfirmEmailPath"]}?token={token}&email={user.Email}";


            var body = $"<p>Olá: {user.UserName}</p>" +
                        "<p>Por favor, confirma o teu email clicando no seguinte link.</p>" + $"<p><a href=\"{url}\">Clica aqui.</a></p>" +
                        "<p>Obrigado, </p>" +
                        $"<br>{_config["Email: ApplicationName"]}";

            var emailSend = new EmailSendDto(user.Email, "Confirma o teu email", body);
            return await _emailService.SendEmailAsync(emailSend);
        }

        /// <summary>
        /// Sends an email to the user with instructions on how to reset their password.
        /// </summary>
        /// <param name="user">User object to whom the password reset email will be sent.</param>
        /// <returns>True if the email was sent successfully, otherwise false.</returns>
        private async Task<bool> SendForgotPasswordEmail(User user)
        {
            var token = await _userManager.GeneratePasswordResetTokenAsync(user);
            token = WebEncoders.Base64UrlEncode(Encoding.UTF8.GetBytes(token));
            var url = $"{_config["JWT:ClientUrl"]}/{_config["Email:ResetPasswordPath"]}?token={token}&email={user.Email}";


            var body = $"<p>Olá: {user.UserName}</p>" +
                        "<p>Para trocares a tua palavra-passe, clica no seguinte link.</p>" + $"<p><a href=\"{url}\">Clica aqui</a></p>" +
                        "<p>Obrigado,</p>" +
                        $"<br>{_config["Email: ApplicationName"]}";

            var emailSend = new EmailSendDto(user.Email, "Troca a tua palavra-passe", body);
            return await _emailService.SendEmailAsync(emailSend);
        }
        #endregion
    }


}
