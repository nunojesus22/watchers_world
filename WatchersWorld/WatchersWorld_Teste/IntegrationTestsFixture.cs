using Microsoft.AspNetCore.Authentication.JwtBearer;
using Microsoft.AspNetCore.Identity;
using Microsoft.EntityFrameworkCore;
using Microsoft.Extensions.Configuration;
using Microsoft.Extensions.DependencyInjection;
using Microsoft.Extensions.Logging.Abstractions;
using Microsoft.Extensions.Logging;
using Microsoft.IdentityModel.Tokens;
using System.Text;
using WatchersWorld.Server.Data;
using WatchersWorld.Server.Models.Authentication;
using WatchersWorld.Server.Services;

namespace WatchersWorld_Teste
{
    public class IntegrationTestsFixture : IDisposable
    {
        public IServiceProvider ServiceProvider { get; private set; }
        public IConfiguration Configuration { get; private set; }
        public WatchersWorldServerContext Context { get; private set; }
        public UserManager<WatchersWorld.Server.Models.Authentication.User> UserManager { get; private set; }
        public IFollowersService _followersService { get; private set; }

        public IntegrationTestsFixture()
        {
            var services = new ServiceCollection();

            var configuration = new Dictionary<string, string>
            {
                ["JWT:Key"] = "tKkT1rmWEFY54oM67WDF3QTUardFIHZO",
                ["JWT:Issuer"] = "http://localhost",
                ["JWT:ExpiresInDays"] = "15", 
                ["MailJet:Apikey"] = "ce980297a2b90b162b7fa4ece38dfcaf",
                ["MailJet:SecretKey"] = "3963e0bf50a04d0d7b61537ac753a6aa",
                ["Email:From"] = "watchers.world.2024@gmail.com",
                ["Email:ApplicationName"] = "Watchers World"
            };

            Configuration = new ConfigurationBuilder()
                .AddInMemoryCollection(configuration!)
                .Build();

            services.AddSingleton<IConfiguration>(Configuration);

            services.AddTransient(typeof(ILogger<>), typeof(NullLogger<>));

            services.AddScoped<JWTService>();
            services.AddScoped<EmailService>();
            services.AddScoped<IFollowersService, FollowersService>();

            services.AddDbContext<WatchersWorldServerContext>(options =>
                options.UseInMemoryDatabase("TestDb"));

            // Adicionar e configurar Identity
            services.AddIdentity<WatchersWorld.Server.Models.Authentication.User, IdentityRole>()
                    .AddEntityFrameworkStores<WatchersWorldServerContext>()
                    .AddDefaultTokenProviders();

            services.AddIdentityCore<WatchersWorld.Server.Models.Authentication.User>(options =>
            {
                //configurações email
                options.Password.RequiredLength = 8;
                options.Password.RequireDigit = true;
                options.Password.RequireLowercase = true;
                options.Password.RequireUppercase = true;
                options.Password.RequireNonAlphanumeric = false;

                //para confirmar email
                options.SignIn.RequireConfirmedEmail = true;
            })
                .AddRoles<IdentityRole>() //para adicionar roles
                .AddRoleManager<RoleManager<IdentityRole>>() //usar o RoleManager
                .AddEntityFrameworkStores<WatchersWorldServerContext>() //usar o nosso context
                .AddSignInManager<SignInManager<WatchersWorld.Server.Models.Authentication.User>>() //usar o SignInManager
                .AddUserManager<UserManager<WatchersWorld.Server.Models.Authentication.User>>() //usar o UserManager
                .AddDefaultTokenProviders();

            // Configurar autenticação JWT
            services.AddAuthentication(options =>
            {
                options.DefaultAuthenticateScheme = JwtBearerDefaults.AuthenticationScheme;
                options.DefaultChallengeScheme = JwtBearerDefaults.AuthenticationScheme;
            })
            .AddJwtBearer(options =>
            {
                options.TokenValidationParameters = new TokenValidationParameters
                {
                    ValidateIssuerSigningKey = true,
                    IssuerSigningKey = new SymmetricSecurityKey(Encoding.UTF8.GetBytes(Configuration["JWT:Key"]!)),
                    ValidIssuer = Configuration["JWT:Issuer"],
                    ValidateIssuer = true,
                    ValidateAudience = false
                };
            });

            services.AddCors(options =>
            {
                options.AddPolicy("AllowAllOrigins", builder =>
                    builder.AllowAnyOrigin()
                           .AllowAnyMethod()
                           .AllowAnyHeader());
            });

            ServiceProvider = services.BuildServiceProvider();
            Context = ServiceProvider.GetRequiredService<WatchersWorldServerContext>();
            UserManager = ServiceProvider.GetRequiredService<UserManager<WatchersWorld.Server.Models.Authentication.User>>();
            _followersService = ServiceProvider.GetRequiredService<IFollowersService>();
            Context.Database.EnsureCreated();
            SeedDatabaseForFollowersTestAsync().Wait();
        }

        public void Dispose() => Context.Database.EnsureDeleted();

        public async Task SeedDatabaseForFollowersTestAsync()
        {
            await AddUserWithProfileAsync("usertest1@gmail.com", "UserTest1", "google", true, "Public");
            await AddUserWithProfileAsync("usertest2@gmail.com", "UserTest2", "Credentials", true, "Public");
            await AddUserWithProfileAsync("usertest3@gmail.com", "UserTest3", "Credentials", true, "Public");
            await AddUserWithProfileAsync("usertest4@gmail.com", "UserTest4", "Credentials", true, "Public");
            await AddUserWithProfileAsync("usertest5@gmail.com", "UserTest5", "Credentials", true, "Private");
            await AddUserWithProfileAsync("usertest6@gmail.com", "UserTest6", "Credentials", true, "Private");
            await AddUserWithProfileAsync("usertest6@gmail.com", "UserTest7", "Credentials", true, "Private");

            var user1ToGetId = await UserManager.FindByNameAsync("UserTest1");
            var user2ToGetId = await UserManager.FindByNameAsync("UserTest2");
            var user3ToGetId = await UserManager.FindByNameAsync("UserTest3");
            var user4ToGetId = await UserManager.FindByNameAsync("UserTest4");
            var user5ToGetId = await UserManager.FindByNameAsync("UserTest5");
            var user6ToGetId = await UserManager.FindByNameAsync("UserTest6");
            var user7ToGetId = await UserManager.FindByNameAsync("UserTest7");

            await _followersService.Follow(user1ToGetId!.Id, user2ToGetId!.Id);
            await _followersService.Follow(user1ToGetId!.Id, user3ToGetId!.Id);
            await _followersService.Follow(user2ToGetId!.Id, user3ToGetId!.Id);
            await _followersService.Follow(user2ToGetId!.Id, user4ToGetId!.Id);
            await _followersService.Follow(user3ToGetId!.Id, user1ToGetId!.Id);
            await _followersService.Follow(user1ToGetId!.Id, user6ToGetId!.Id);
            await _followersService.Follow(user2ToGetId!.Id, user6ToGetId!.Id);
            await _followersService.Follow(user3ToGetId!.Id, user6ToGetId!.Id);
            await _followersService.Follow(user4ToGetId!.Id, user6ToGetId!.Id);
            await _followersService.Follow(user1ToGetId!.Id, user7ToGetId!.Id);
            await _followersService.Follow(user2ToGetId!.Id, user7ToGetId!.Id);
            await _followersService.Follow(user3ToGetId!.Id, user7ToGetId!.Id);
            await _followersService.Follow(user4ToGetId!.Id, user7ToGetId!.Id);
            await _followersService.AcceptFollowSend(user6ToGetId!.Id, user1ToGetId!.Id);
            await _followersService.RejectFollowSend(user6ToGetId!.Id, user2ToGetId!.Id);

            await Context.SaveChangesAsync();
        }

        private async Task AddUserWithProfileAsync(string email, string userName, string provider, bool emailConfirmed, string profileStatus = "Public")
        {
            var user = new WatchersWorld.Server.Models.Authentication.User
            {
                Email = email,
                UserName = userName,
                Provider = provider,
                EmailConfirmed = emailConfirmed,
            };

            var result = await UserManager.CreateAsync(user, user.UserName);
            if (!result.Succeeded)
            {
                throw new Exception("Failed to create user: " + result.Errors.FirstOrDefault()?.Description);
            }

            var userProfile = new ProfileInfo
            {
                UserId = user.Id,
                UserName = user.UserName,
                Description = "Description for " + userName,
                Gender = 'M',
                BirthDate = DateTime.Now.AddYears(-20),
                ProfileStatus = profileStatus,
                ProfilePhoto = "assets/img/pfp2.png",
                CoverPhoto = "assets/img/pfp2.png",
                Following = 0,
                Followers = 0
            };

            Context.ProfileInfo.Add(userProfile);
            await Context.SaveChangesAsync();
        }
    }

    [CollectionDefinition("Database collection")]
    public class DatabaseCollection : ICollectionFixture<IntegrationTestsFixture>
    {
        
    }

}
