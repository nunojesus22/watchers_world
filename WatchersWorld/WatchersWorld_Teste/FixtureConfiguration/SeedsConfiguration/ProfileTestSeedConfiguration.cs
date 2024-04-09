using Microsoft.AspNetCore.Identity;
using Microsoft.EntityFrameworkCore;
using System;
using System.Collections.Generic;
using System.Linq;
using System.Text;
using System.Threading.Tasks;
using WatchersWorld.Server.Chat.Models;
using WatchersWorld.Server.Data;
using WatchersWorld.Server.Models.Authentication;
using WatchersWorld.Server.Models.Gamification;
using WatchersWorld.Server.Models.Media;
using WatchersWorld.Server.Models.Notifications;
using WatchersWorld.Server.Services;

namespace WatchersWorld_Teste.FixtureConfiguration.SeedsConfiguration
{
    public class ProfileTestSeedConfiguration : ISeedConfiguration
    {
        private static bool _isSeed;
        private readonly IProfileService _profileService;

        public ProfileTestSeedConfiguration(IProfileService profileService)
        {
            _profileService = profileService;
        }

        public async Task SeedAsync(UserManager<User> userManager, WatchersWorldServerContext context)
        {
            if (!_isSeed)
            {
                await AddUserWithProfileAsync(userManager, context, "usertest1@gmail.com", "UserTest1", "google", true, "Public");
                await AddUserWithProfileAsync(userManager, context, "usertest2@gmail.com", "UserTest2", "Credentials", true, "Public");

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
