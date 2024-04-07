using Microsoft.AspNetCore.Identity;
using System;
using System.Collections.Generic;
using System.Linq;
using System.Text;
using System.Threading.Tasks;
using WatchersWorld.Server.Data;
using WatchersWorld.Server.Models.Authentication;
using WatchersWorld.Server.Models.Gamification;
using WatchersWorld.Server.Services;

namespace WatchersWorld_Teste.FixtureConfiguration.SeedsConfiguration
{
    internal class GamificationTestSeedConfiguration : ISeedConfiguration
    {

        private static bool _isSeed;
        private readonly IGamificationService _gamificationService;

        public GamificationTestSeedConfiguration(IGamificationService gamificationService)
        {
            _gamificationService = gamificationService;
        }

        
        

        public async Task SeedAsync(UserManager<User> userManager, WatchersWorldServerContext context)
        {
            if (!_isSeed)
            {
                

                await AddUserWithProfileAsync(userManager, context, "usertest1@gmail.com", "UserTest1", "google", true, "Public");
                await AddUserWithProfileAsync(userManager, context, "usertest2@gmail.com", "UserTest2", "Credentials", true, "Public");
                await AddUserWithProfileAsync(userManager, context, "usertest3@gmail.com", "UserTest3", "Credentials", false, "Public");
                await AddUserWithProfileAsync(userManager, context, "usertest4@gmail.com", "UserTest4", "Credentials", true, "Public");
                await AddUserWithProfileAsync(userManager, context, "usertest5@gmail.com", "UserTest5", "Credentials", true, "Private");
                await AddUserWithProfileAsync(userManager, context, "usertest6@gmail.com", "UserTest6", "Credentials", false, "Private");
                await AddUserWithProfileAsync(userManager, context, "usertest9@gmail.com", "UserTest9", "Credentials", false, "Private");
                await AddUserWithProfileAsync(userManager, context, "usertest10@gmail.com", "UserTest10", "Credentials", false, "Private");


                var medals = new List<Medals>
                {
                    new Medals { Name = "Conta Criada", Description = "Criar uma conta", Image = "../../assets/img/medal.png"},
                    new Medals { Name = "Primeiro Filme", Description = "Marcar 1 filme como visto", Image = "../../assets/img/medal.png"},
                    new Medals { Name = "Primeira Série", Description = "Marcar 1 série como visto", Image = "../../assets/img/medal.png"},
                    new Medals { Name = "Seguir um utilizador", Description = "Seguir o seu primeiro utilizador", Image = "../../assets/img/medal.png"},
                    new Medals { Name = "Editar perfil", Description = "Editar o perfil pela primeira vez", Image = "../../assets/img/medal.png"},
                    // Add more medals as needed
                };
                context.Medals.AddRange(medals);


                await context.SaveChangesAsync();

                _isSeed = true;
            }

        }

        private async Task AddUserWithProfileAsync(UserManager<User> userManager, WatchersWorldServerContext context, string email, string userName, string provider, bool emailConfirmed, string profileStatus = "Public")
        {
            var user = new User
            {
                Email = email,
                UserName = userName,
                Provider = provider,
                EmailConfirmed = emailConfirmed,
            };

            var result = await userManager.CreateAsync(user, user.UserName);
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

            context.ProfileInfo.Add(userProfile);
            await context.SaveChangesAsync();
        }
    }
}
