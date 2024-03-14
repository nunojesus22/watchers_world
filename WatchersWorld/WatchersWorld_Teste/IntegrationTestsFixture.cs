using Google;
using Microsoft.AspNetCore.Authentication.JwtBearer;
using Microsoft.AspNetCore.Identity;
using Microsoft.EntityFrameworkCore;
using Microsoft.Extensions.Configuration;
using Microsoft.Extensions.DependencyInjection;
using Microsoft.Extensions.Logging.Abstractions;
using Microsoft.Extensions.Logging;
using Microsoft.IdentityModel.Tokens;
using System;
using System.Collections.Generic;
using System.Linq;
using System.Text;
using System.Threading.Tasks;
using WatchersWorld.Server.Data;
using WatchersWorld.Server.Models.Authentication;
using WatchersWorld.Server.Services;
using Mailjet.Client.Resources;

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
        }

        public void Dispose() => Context.Database.EnsureDeleted();

        public async Task SeedDatabaseForAccountTestAsync()
        {
            var user1 = new WatchersWorld.Server.Models.Authentication.User
            {
                Email = "usertest1@gmail.com",
                UserName = "UserTest1",
                Provider = "google",
                EmailConfirmed = true,
            };

            var user2 = new WatchersWorld.Server.Models.Authentication.User
            {
                Email = "usertest2@gmail.com",
                UserName = "UserTest2",
                Provider = "Credentials",
                EmailConfirmed = true,
            };

            var user3 = new WatchersWorld.Server.Models.Authentication.User
            {
                Email = "usertest3@gmail.com",
                UserName = "UserTest3",
                Provider = "Credentials",
                EmailConfirmed = false,
            };

            var user6 = new WatchersWorld.Server.Models.Authentication.User
            {
                Email = "usertest6@gmail.com",
                UserName = "UserTest6",
                Provider = "Credentials",
                EmailConfirmed = false,
            };

            await UserManager.CreateAsync(user1, user1.UserName);
            await UserManager.CreateAsync(user2, user2.UserName);
            await UserManager.CreateAsync(user3, user3.UserName);
            await UserManager.CreateAsync(user6, user6.UserName);
            await Context.SaveChangesAsync();
        }
    
        public async Task SeedDatabaseForFollowersTestAsync()
        {
            var user1 = new WatchersWorld.Server.Models.Authentication.User
            {
                Email = "usertest1@gmail.com",
                UserName = "UserTest1",
                Provider = "google",
                EmailConfirmed = true,
            };

            var user2 = new WatchersWorld.Server.Models.Authentication.User
            {
                Email = "usertest2@gmail.com",
                UserName = "UserTest2",
                Provider = "Credentials",
                EmailConfirmed = true,
            };

            var user3 = new WatchersWorld.Server.Models.Authentication.User
            {
                Email = "usertest3@gmail.com",
                UserName = "UserTest3",
                Provider = "Credentials",
                EmailConfirmed = true,
            };

            var user4 = new WatchersWorld.Server.Models.Authentication.User
            {
                Email = "usertest4@gmail.com",
                UserName = "UserTest4",
                Provider = "Credentials",
                EmailConfirmed = true,
            };

            var user5 = new WatchersWorld.Server.Models.Authentication.User
            {
                Email = "usertest5@gmail.com",
                UserName = "UserTest5",
                Provider = "Credentials",
                EmailConfirmed = true,
            };

            var user6 = new WatchersWorld.Server.Models.Authentication.User
            {
                Email = "usertest6@gmail.com",
                UserName = "UserTest6",
                Provider = "Credentials",
                EmailConfirmed = true,
            };

            await UserManager.CreateAsync(user1, user1.UserName);
            await UserManager.CreateAsync(user2, user2.UserName);
            await UserManager.CreateAsync(user3, user3.UserName);
            await UserManager.CreateAsync(user4, user4.UserName);
            await UserManager.CreateAsync(user5, user5.UserName);
            await UserManager.CreateAsync(user6, user6.UserName);

            var user1ToGetId = await UserManager.FindByNameAsync(user1.UserName);

            var user2ToGetId = await UserManager.FindByNameAsync(user2.UserName);

            var user3ToGetId = await UserManager.FindByNameAsync(user3.UserName);

            var user4ToGetId = await UserManager.FindByNameAsync(user4.UserName);

            var user5ToGetId = await UserManager.FindByNameAsync(user5.UserName);

            var user6ToGetId = await UserManager.FindByNameAsync(user6.UserName);

            await _followersService.Follow(user1ToGetId!.Id, user2ToGetId!.Id);
            await _followersService.Follow(user1ToGetId!.Id, user3ToGetId!.Id);
            await _followersService.Follow(user2ToGetId!.Id, user3ToGetId!.Id);
            await _followersService.Follow(user2ToGetId!.Id, user4ToGetId!.Id);
            await _followersService.Follow(user3ToGetId!.Id, user1ToGetId!.Id);

            await Context.SaveChangesAsync();
        }
    }

    [CollectionDefinition("Database collection")]
    public class DatabaseCollection : ICollectionFixture<IntegrationTestsFixture>
    {
        
    }

}
