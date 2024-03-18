using Microsoft.AspNetCore.Identity;
using Microsoft.AspNetCore.Mvc;
using Microsoft.Identity.Client.Platforms.Features.DesktopOs.Kerberos;
using WatchersWorld.Server.Models.Authentication;

namespace WatchersWorld.Server.Data
{
    public class DataSeeder
    {

        public static async Task SeedData(WatchersWorldServerContext context, UserManager<User> userManager) 
        {
            await SeedTestUser(context, userManager);
        }

        private static async Task SeedTestUser(WatchersWorldServerContext context, UserManager<User> userManager)
        {
            await AddUserWithProfileAsync(context, userManager, "usertest1@gmail.com", "UserTest1", "google", true, "Public");
            await AddUserWithProfileAsync(context, userManager, "usertest2@gmail.com", "UserTest2", "Credentials", true, "Public");
            await AddUserWithProfileAsync(context, userManager, "usertest3@gmail.com", "UserTest3", "Credentials", true, "Public");
            await AddUserWithProfileAsync(context, userManager, "usertest4@gmail.com", "UserTest4", "Credentials", true, "Public");
            await AddUserWithProfileAsync(context, userManager, "usertest5@gmail.com", "UserTest5", "Credentials", true, "Private");
            await AddUserWithProfileAsync(context, userManager, "usertest6@gmail.com", "UserTest6", "Credentials", true, "Private");
            await AddUserWithProfileAsync(context, userManager, "usertest6@gmail.com", "UserTest7", "Credentials", true, "Private");
        }

        private static async Task AddUserWithProfileAsync(WatchersWorldServerContext context, UserManager<User> userManager, string email, string userName, string provider, bool emailConfirmed, string profileStatus = "Public")
        {
            var user = new WatchersWorld.Server.Models.Authentication.User
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
                ProfilePhoto = "assets/img/nuno-pfp.png",
                CoverPhoto = "assets/img/pfp2.png",
                Following = 0,
                Followers = 0
            };

            context.ProfileInfo.Add(userProfile);
            await context.SaveChangesAsync();
        }

    }
}
