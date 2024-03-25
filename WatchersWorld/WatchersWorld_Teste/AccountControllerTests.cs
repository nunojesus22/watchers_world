using Microsoft.AspNetCore.Identity;
using Microsoft.AspNetCore.Mvc;
using Microsoft.AspNetCore.WebUtilities;
using Microsoft.Extensions.DependencyInjection;
using Microsoft.Extensions.Logging;
using Newtonsoft.Json;
using Newtonsoft.Json.Linq;
using System.Text;
using WatchersWorld.Server.Controllers;
using WatchersWorld.Server.Data;
using WatchersWorld.Server.DTOs.Account;
using WatchersWorld.Server.Models.Authentication;
using WatchersWorld.Server.Services;
using WatchersWorld_Teste.FixtureConfiguration;
using WatchersWorld_Teste.FixtureConfiguration.SeedsConfiguration;


namespace WatchersWorld_Teste
{
    public class AccountControllerTests : IClassFixture<IntegrationTestsFixture>
    {
        private readonly WatchersWorldServerContext _context;
        private readonly AccountController _accountController;
        private readonly UserManager<User> _userManager;
        private readonly SignInManager<User> _signInManager;
        private readonly JWTService _jwtService;
        private readonly EmailService _emailService;

        public AccountControllerTests(IntegrationTestsFixture fixture)
        {
            _context = fixture.Context;
            _userManager = fixture.UserManager;
            _signInManager = fixture.ServiceProvider.GetRequiredService<SignInManager<User>>();
            _jwtService = fixture.ServiceProvider.GetRequiredService<JWTService>();
            _emailService = fixture.ServiceProvider.GetRequiredService<EmailService>();
            var logger = fixture.ServiceProvider.GetRequiredService<ILogger<AccountController>>();
            
            _accountController = new AccountController(_jwtService, _signInManager, _userManager, _emailService, fixture.Configuration, _context, logger);
            
            fixture.ApplySeedAsync(new AccountControllerTestSeedConfiguration(fixture.ServiceProvider.GetRequiredService<RoleManager<IdentityRole>>())).Wait();
        }

        [Fact]
        public async Task Register_InvalidModel_ShouldReturnBadRequestWithErrors()
        {
            var model = new RegisterDto
            {
                Username = "ABC",
                Email = "usertest@gmail.com",
                Password = "userTest1"
            };

            _accountController.ModelState.AddModelError("Username", "O nome de utilizador tem de conter entre 4-20 caracteres!");

            var result = await _accountController.Register(model);

            var badRequestResult = Assert.IsType<BadRequestObjectResult>(result);
            var errorObject = JObject.FromObject(badRequestResult.Value!);
            var errors = errorObject["Errors"]!.ToObject<List<JObject>>();

            var error = errors!.FirstOrDefault(err => err.Value<string>("Field") == "Username" && err.Value<string>("Message")!.Contains("O nome de utilizador tem de conter entre 4-20 caracteres!"));
            Assert.NotNull(error);
        }

        [Fact]
        public async Task Register_EmailExistsWithGoogle_ShouldReturnsBadRquestWithErros()
        {
            var model = new RegisterDto
            {
                Username = "ABC",
                Email = "usertest1@gmail.com",
                Password = "userTest1"
            };

            var result = await _accountController.Register(model);

            var badRequestResult = Assert.IsType<BadRequestObjectResult>(result);
            var errorObject = JObject.FromObject(badRequestResult.Value!);

            var errorMessage = errorObject.Value<string>("Message");
            var errorField = errorObject.Value<string>("Field");

            Assert.Equal("Email", errorField);
            Assert.Equal("Email associado a uma conta google!", errorMessage);
        }

        [Fact]
        public async Task Register_UsernameAlreadyExists_ShouldReturnsBadRquestWithErros()
        {
            var model = new RegisterDto
            {
                Username = "UserTest2",
                Email = "usertest4@gmail.com",
                Password = "userTest2"
            };

            var result = await _accountController.Register(model);

            var badRequestResult = Assert.IsType<BadRequestObjectResult>(result);
            var errorObject = JObject.FromObject(badRequestResult.Value!);

            var errorMessage = errorObject.Value<string>("Message");
            var errorField = errorObject.Value<string>("Field");

            Assert.Equal("Username", errorField);
            Assert.Equal("Já existe um utilizador com esse nome de utilizador!", errorMessage);
        }

        [Fact]
        public async Task Register_EmailAlreadyExists_ShouldReturnsBadRquestWithErros()
        {
            var model = new RegisterDto
            {
                Username = "UserTest",
                Email = "usertest3@gmail.com",
                Password = "userTest"
            };

            var result = await _accountController.Register(model);

            var badRequestResult = Assert.IsType<BadRequestObjectResult>(result);
            var errorObject = JObject.FromObject(badRequestResult.Value!);

            var errorMessage = errorObject.Value<string>("Message");
            var errorField = errorObject.Value<string>("Field");

            Assert.Equal("Email", errorField);
            Assert.Equal("Já existe uma conta associada a esse email!", errorMessage);
        }

        [Fact]
        public async Task Register_Sucess_ShouldReturnsOk()
        {
            var model = new RegisterDto
            {
                Username = "UserTest7",
                Email = "usertest7@gmail.com",
                Password = "userTest7"
            };

            var result = await _accountController.Register(model);
            var okResult = Assert.IsType<OkObjectResult>(result);
            string value = JsonConvert.SerializeObject(okResult.Value);
            JObject jsonObject = JObject.Parse(value);
            JObject valueObject = (JObject)jsonObject["Value"]!;

            string title = valueObject["title"]!.ToString();
            string message = valueObject["message"]!.ToString();

            Assert.Equal("Account Created", title);
            Assert.Equal("A tua conta foi criada com sucesso! Confirma o teu email.", message);
        }

        [Fact] 
        public async Task Register_Sucess_ShouldAddInfoToProfileInfo()
        {
            var model = new RegisterDto
            {
                Username = "UserTest11",
                Email = "usertest11@gmail.com",
                Password = "userTest11"
            };

            var result = await _accountController.Register(model);
            var userCreated = await _userManager.FindByEmailAsync(model.Email);
            Assert.False(userCreated!.EmailConfirmed);

            var userProfileInfo = _context.ProfileInfo.Where(p => p.UserId == userCreated.Id).ToList();
            Assert.NotNull(userProfileInfo);
        }

        [Fact]
        public async Task ResetPassword_NonExistentAccount_ShouldReturnBadRequestWithErrors()
        {
            var model = new ResetPasswordDto
            {
                Token = "ABC",
                Email = "usertest8@gmail.com",
                NewPassword = "userTest8"
            };

            var result = await _accountController.ResetPassword(model);

            var badRequestResult = Assert.IsType<BadRequestObjectResult>(result);
            var errorObject = JObject.FromObject(badRequestResult.Value!);

            var errorMessage = errorObject.Value<string>("Message");
            var errorField = errorObject.Value<string>("Field");

            Assert.Equal("Password", errorField);
            Assert.Equal("Não existe nenhuma conta associada a esse email!", errorMessage);
        }

        [Fact]
        public async Task ResetPassword_EmailToConfirm_ShouldReturnBadRequestWithErrors()
        {
            var model = new ResetPasswordDto
            {
                Token = "ABC",
                Email = "usertest9@gmail.com",
                NewPassword = "userTest9"
            };

            var result = await _accountController.ResetPassword(model);

            var badRequestResult = Assert.IsType<BadRequestObjectResult>(result);
            var errorObject = JObject.FromObject(badRequestResult.Value!);

            var errorMessage = errorObject.Value<string>("Message");
            var errorField = errorObject.Value<string>("Field");

            Assert.Equal("Password", errorField);
            Assert.Equal("O email tem de ser confirmado primeiro!", errorMessage);
        }

        [Fact]
        public async Task ResetPassword_InvalidToken_ShouldReturnBadRequestWithErrors()
        {
            var model = new ResetPasswordDto
            {
                Token = "ABC",
                Email = "usertest2@gmail.com",
                NewPassword = "userTest2"
            };

            var result = await _accountController.ResetPassword(model);

            var badRequestResult = Assert.IsType<BadRequestObjectResult>(result);
            var errorObject = JObject.FromObject(badRequestResult.Value!);

            var errorMessage = errorObject.Value<string>("Message");
            var errorField = errorObject.Value<string>("Field");

            Assert.Equal("Password", errorField);
            Assert.Equal("Token Inválido. Tente novamente.", errorMessage);
        }

        [Fact]
        public async Task ResetPassword_Sucess_ShouldReturnOk()
        {
            var model = new ResetPasswordDto
            {
                Token = "",
                Email = "usertest1@gmail.com",
                NewPassword = "userTest4"
            };

            var user = await _userManager.FindByEmailAsync(model.Email);
            var token = await _userManager.GeneratePasswordResetTokenAsync(user!);
            token = WebEncoders.Base64UrlEncode(Encoding.UTF8.GetBytes(token));
            model.Token = token;

            var result = _accountController.ResetPassword(model);

            var okResult = Assert.IsType<OkObjectResult>(result.Result);
            string value = JsonConvert.SerializeObject(okResult.Value);
            JObject jsonObject = JObject.Parse(value);
            JObject valueObject = (JObject)jsonObject["Value"]!;

            string title = valueObject["title"]!.ToString();
            string message = valueObject["message"]!.ToString();

            Assert.Equal("Nova password confirmada", title);
            Assert.Equal("A tua password foi alterada com sucesso! Consegues dar login agora.", message);
        }

        [Fact]
        public async Task ForgotPassword_NonExistentAccount_ShouldReturnBadRequestWithErrors()
        {
            var result = await _accountController.ForgotPassword("usertest8@gmail.com");

            var badRequestResult = Assert.IsType<BadRequestObjectResult>(result);
            var errorObject = JObject.FromObject(badRequestResult.Value!);

            var errorMessage = errorObject.Value<string>("Message");
            var errorField = errorObject.Value<string>("Field");

            Assert.Equal("Email", errorField);
            Assert.Equal("Não existe nenhuma conta associada a esse email!", errorMessage);
        }

        [Fact]
        public async Task ForgotPassword_EmailToConfirm_ShouldReturnBadRequestWithErrors()
        {
            var result = await _accountController.ForgotPassword("usertest9@gmail.com");

            var badRequestResult = Assert.IsType<BadRequestObjectResult>(result);
            var errorObject = JObject.FromObject(badRequestResult.Value!);

            var errorMessage = errorObject.Value<string>("Message");
            var errorField = errorObject.Value<string>("Field");

            Assert.Equal("Email", errorField);
            Assert.Equal("O email tem de ser confirmado primeiro!", errorMessage);
        }

        [Fact]
        public async Task ResendEmailConfirmationLink_NonExistentAccount_ShouldReturnBadRequestWithErrors()
        {
            var result = await _accountController.ResendEmailConfirmationLink("usertest8@gmail.com");

            var badRequestResult = Assert.IsType<BadRequestObjectResult>(result);
            var errorObject = JObject.FromObject(badRequestResult.Value!);

            var errorMessage = errorObject.Value<string>("Message");
            var errorField = errorObject.Value<string>("Field");

            Assert.Equal("Email", errorField);
            Assert.Equal("Não existe nenhuma conta associada a esse email!", errorMessage);
        }

        [Fact]
        public async Task ResendEmailConfirmationLink_EmailAlreadyConfirmed_ShouldReturnBadRequestWithErrors()
        {
            var result = await _accountController.ResendEmailConfirmationLink("usertest2@gmail.com");

            var badRequestResult = Assert.IsType<BadRequestObjectResult>(result);
            var errorObject = JObject.FromObject(badRequestResult.Value!);

            var errorMessage = errorObject.Value<string>("Message");
            var errorField = errorObject.Value<string>("Field");

            Assert.Equal("Email", errorField);
            Assert.Equal("O email já foi confirmado anteriormente!", errorMessage);
        }

        [Fact]
        public async Task ConfirmEmail_NonExistentAccount_ShouldReturnBadRequestWithErrors()
        {
            var model = new ConfirmEmailDto
            {
                Token = "123",
                Email = "usertest12@gmail.com"
            };

            var result = await _accountController.ConfirmEmail(model);

            var badRequestResult = Assert.IsType<BadRequestObjectResult>(result);
            var errorObject = JObject.FromObject(badRequestResult.Value!);

            var errorMessage = errorObject.Value<string>("Message");
            var errorField = errorObject.Value<string>("Field");

            Assert.Equal("Email", errorField);
            Assert.Equal("Não existe nenhuma conta associada a esse email!", errorMessage);
        }

        [Fact]
        public async Task ConfirmEmail_EmailAlreadyConfirmed_ShouldReturnBadRequestWithErrors()
        {
            var model = new ConfirmEmailDto
            {
                Token = "123",
                Email = "usertest1@gmail.com"
            };

            var result = await _accountController.ConfirmEmail(model);

            var badRequestResult = Assert.IsType<BadRequestObjectResult>(result);
            var errorObject = JObject.FromObject(badRequestResult.Value!);

            var errorMessage = errorObject.Value<string>("Message");
            var errorField = errorObject.Value<string>("Field");

            Assert.Equal("Email", errorField);
            Assert.Equal("O email já foi confirmado anteriormente!", errorMessage);
        }

        [Fact]
        public async Task ConfirmEmail_InvalidToken_ShouldReturnBadRequestWithErrors()
        {
            var model = new ConfirmEmailDto
            {
                Token = "ABC",
                Email = "usertest6@gmail.com"
            };

            var result = await _accountController.ConfirmEmail(model);

            var badRequestResult = Assert.IsType<BadRequestObjectResult>(result);
            var errorObject = JObject.FromObject(badRequestResult.Value!);

            var errorMessage = errorObject.Value<string>("Message");
            var errorField = errorObject.Value<string>("Field");

            Assert.Equal("Email", errorField);
            Assert.Equal("Token Inválido. Tente novamente.", errorMessage);
        }

        [Fact]
        public async Task ConfirmEmail_Sucess_ShouldReturnOk()
        {
            var model = new ConfirmEmailDto
            {
                Token = "",
                Email = "usertest3@gmail.com"
            };

            var user = await _userManager.FindByEmailAsync(model.Email);
            var token = await _userManager.GenerateEmailConfirmationTokenAsync(user!);
            token = WebEncoders.Base64UrlEncode(Encoding.UTF8.GetBytes(token));
            model.Token = token;

            var result = _accountController.ConfirmEmail(model);

            var okResult = Assert.IsType<OkObjectResult>(result.Result);
            string value = JsonConvert.SerializeObject(okResult.Value);
            JObject jsonObject = JObject.Parse(value);
            JObject valueObject = (JObject)jsonObject["Value"]!;

            string title = valueObject["title"]!.ToString();
            string message = valueObject["message"]!.ToString();

            Assert.Equal("Email Confirmed", title);
            Assert.Equal("O teu email foi confirmado com sucesso! Consegues dar login agora.", message);
        }

        [Fact]
        public async Task Login_InvalidModel_ShouldReturnBadRequestWithErrors()
        {
            var model = new LoginDto
            {
                Email = "usertest@gmail.com",
                Password = "user"
            };

            _accountController.ModelState.AddModelError("Password", "A palavra-passe tem de conter entre 8-12 caracteres, entre eles pelo menos uma letra minúscula, uma letra maiúscula e um número!");

            var result = await _accountController.Login(model);

            var badRequestResult = Assert.IsType<BadRequestObjectResult>(result.Result);
            var errorObject = JObject.FromObject(badRequestResult.Value!);
            var errors = errorObject["Errors"]!.ToObject<List<JObject>>();

            var error = errors!.FirstOrDefault(err => err.Value<string>("Field") == "Password" && err.Value<string>("Message")!.Contains("A palavra-passe tem de conter entre 8-12 caracteres, entre eles pelo menos uma letra minúscula, uma letra maiúscula e um número!"));
            Assert.NotNull(error);
        }

        [Fact]
        public async Task Login_EmailExistsWithGoogle_ShouldReturnsBadRquestWithErros()
        {
            var model = new LoginDto
            {
                Email = "usertest1@gmail.com",
                Password = "UserTest1"
            };

            var result = await _accountController.Login(model);

            var badRequestResult = Assert.IsType<BadRequestObjectResult>(result.Result);
            var errorObject = JObject.FromObject(badRequestResult.Value!);

            var errorMessage = errorObject.Value<string>("Message");
            var errorField = errorObject.Value<string>("Field");

            Assert.Equal("Email", errorField);
            Assert.Equal("Email associado a uma conta google!", errorMessage);
        }

        [Fact]
        public async Task Login_NonExistentAccount_ShouldReturnBadRequestWithErrors()
        {
            var model = new LoginDto
            {
                Password = "UserTest8",
                Email = "usertest8@gmail.com"
            };

            var result = await _accountController.Login(model);

            var badRequestResult = Assert.IsType<BadRequestObjectResult>(result.Result);
            var errorObject = JObject.FromObject(badRequestResult.Value!);

            var errorMessage = errorObject.Value<string>("Message");
            var errorField = errorObject.Value<string>("Field");

            Assert.Equal("Email", errorField);
            Assert.Equal("Não existe nenhuma conta associada a esse email!", errorMessage);
        }

        [Fact]
        public async Task Login_EmailToConfirm_ShouldReturnOkWithUserCreated()
        {
            var model = new LoginDto
            {
                Password = "UserTest10",
                Email = "usertest10@gmail.com"
            };

            var result = await _accountController.Login(model);

            var okResult = Assert.IsType<OkObjectResult>(result.Result);
            var errorObject = JObject.FromObject(okResult.Value!);

            var errorMessage = errorObject.Value<string>("message");
            var errorField = errorObject.Value<string>("Field");
            var userObject = errorObject.Value<JObject>("user");

            var user = new UserDto
            {
                Email = userObject!.Value<string>("Email"),
                Username = userObject!.Value<string>("Username"),
                JWT = userObject!.Value<string>("JWT"),
            };

            Assert.Equal("usertest10@gmail.com", user.Email);
            Assert.Equal("UserTest10", user.Username);
            Assert.NotNull(user.JWT);
            Assert.Equal("EmailPorConfirmar", errorField);
            Assert.Equal("A conta está por confirmar!", errorMessage);
        }

        [Fact]
        public async Task Login_IncorrectPassword_ShouldReturnBadRequestWithErrors()
        {
            var model = new LoginDto
            {
                Password = "UserTest4",
                Email = "usertest2@gmail.com"
            };

            var result = await _accountController.Login(model);

            var badRequestResult = Assert.IsType<BadRequestObjectResult>(result.Result);
            var errorObject = JObject.FromObject(badRequestResult.Value!);

            var errorMessage = errorObject.Value<string>("Message");
            var errorField = errorObject.Value<string>("Field");

            Assert.Equal("Password", errorField);
            Assert.Equal("A password está incorreta.", errorMessage);
        }

        [Fact]
        public async Task Login_Sucess_ShouldReturnOkWithUserCreated()
        {
            var model = new LoginDto
            {
                Password = "UserTest2",
                Email = "usertest2@gmail.com"
            };

            var result = await _accountController.Login(model);

            var okResult = Assert.IsType<OkObjectResult>(result.Result);
            var errorObject = JObject.FromObject(okResult.Value!);

            var userObject = errorObject.Value<JObject>("user");

            var user = new UserDto
            {
                Email = userObject!.Value<string>("Email"),
                Username = userObject!.Value<string>("Username"),
                JWT = userObject!.Value<string>("JWT"),
            };

            Assert.Equal("usertest2@gmail.com", user.Email);
            Assert.Equal("UserTest2", user.Username);
            Assert.NotNull(user.JWT);
        }
    }
}
