using Microsoft.AspNetCore.Identity;
using Microsoft.Extensions.Configuration;
using Microsoft.Extensions.DependencyInjection;
using Microsoft.Extensions.Logging.Abstractions;
using Microsoft.Extensions.Logging;
using System;
using System.Collections.Generic;
using System.Configuration;
using System.Linq;
using System.Text;
using System.Threading.Tasks;
using WatchersWorld.Server.Data;
using WatchersWorld.Server.Services;
using Microsoft.EntityFrameworkCore;
using WatchersWorld.Server.Models.Authentication;
using Microsoft.AspNetCore.Authentication.JwtBearer;
using Microsoft.IdentityModel.Tokens;
using WatchersWorld.Server.Controllers;

namespace WatchersWorld_Teste.FixtureConfiguration
{
    public class IntegrationTestsFixture : IDisposable
    {
        public IServiceProvider ServiceProvider { get; private set; }
        public IConfiguration Configuration { get; private set; }
        public WatchersWorldServerContext Context { get; private set; }
        public UserManager<User> UserManager { get; private set; }
        public IFollowersService FollowersService { get; private set; }

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

            services.AddSingleton(Configuration);

            services.AddScoped<JWTService>();
            services.AddScoped<EmailService>();
            services.AddScoped<IFollowersService, FollowersService>();
            services.AddScoped<IRatingMediaService, RatingMediaService>();
            services.AddScoped<RatingMediaService>();
            services.AddScoped<IFavoriteActorService, FavoriteActorService>();
            services.AddScoped<FavoriteActorService>();
            services.AddTransient(typeof(ILogger<AccountController>), provider => NullLogger<AccountController>.Instance);

            services.AddDbContext<WatchersWorldServerContext>(options =>
                options.UseInMemoryDatabase("TestDb"));

            // Adicionar e configurar Identity
            services.AddIdentity<User, IdentityRole>()
                    .AddEntityFrameworkStores<WatchersWorldServerContext>()
                    .AddDefaultTokenProviders();

            services.AddIdentityCore<User>(options =>
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
                .AddSignInManager<SignInManager<User>>() //usar o SignInManager
                .AddUserManager<UserManager<User>>() //usar o UserManager
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
            UserManager = ServiceProvider.GetRequiredService<UserManager<User>>();
            FollowersService = ServiceProvider.GetRequiredService<IFollowersService>();
            Context.Database.EnsureCreated();
        }

        public async Task ApplySeedAsync(ISeedConfiguration seedConfiguration)
        {
            await seedConfiguration.SeedAsync(UserManager, Context);
            await Context.SaveChangesAsync();
        }

        public void Dispose()
        {
            Context.Database.EnsureDeleted();
        }

        /*public async Task AddUserWithProfileAsync(string email, string userName, string provider, bool emailConfirmed, string profileStatus = "Public")
        {
            var user = new User
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
        }*/
    }

    [CollectionDefinition("Followers Collection")]
    public class FollowersCollection : ICollectionFixture<IntegrationTestsFixture>
    {
        // Nada precisa estar aqui
    }

    [CollectionDefinition("Account Collection")]
    public class AccountCollection : ICollectionFixture<IntegrationTestsFixture>
    {
        // Nada precisa estar aqui
    }
}
