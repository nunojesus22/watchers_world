using Microsoft.AspNetCore.Identity;
using System;
using System.Collections.Generic;
using System.Linq;
using System.Text;
using System.Threading.Tasks;
using WatchersWorld.Server.Data;
using WatchersWorld.Server.Models.Authentication;
using WatchersWorld.Server.Services;

namespace WatchersWorld_Teste.FixtureConfiguration.SeedsConfiguration
{
    public class AdminTestSeedConfiguration : ISeedConfigurationAdmin
    {

        private static bool _isSeed;
        private readonly IAdminService _adminService;

        public AdminTestSeedConfiguration(IAdminService adminService)
        {
            _adminService = adminService;
        }

        private static async Task EnsureRolesAsync(RoleManager<IdentityRole> roleManager)
        {
            string[] roles = ["Admin", "Moderator", "User"];

            foreach (string role in roles)
            {
                if (!await roleManager.RoleExistsAsync(role))
                {
                    await roleManager.CreateAsync(new IdentityRole(role));
                }
            }
        }

        public async Task SeedAsync(UserManager<User> userManager, WatchersWorldServerContext context, RoleManager<IdentityRole> roleManager)
        {
            if (!_isSeed)
            {
                await EnsureRolesAsync(roleManager);


                await AddUserWithProfileAsync(userManager, context, roleManager, "usertest1@gmail.com", "UserTest1", "google", true, "Public");
                await AddUserWithProfileAsync(userManager, context, roleManager, "usertest2@gmail.com", "UserTest2", "Credentials", true, "Public");
                await AddUserWithProfileAsync(userManager, context, roleManager, "usertest3@gmail.com", "UserTest3", "Credentials", true, "Public");
                await AddUserWithProfileAsync(userManager, context, roleManager, "usertest4@gmail.com", "UserTest4", "Credentials", true, "Public");
                await AddUserWithProfileAsync(userManager, context, roleManager, "usertest5@gmail.com", "UserTest5", "Credentials", true, "Private");
                await AddUserWithProfileAsync(userManager, context, roleManager, "usertest6@gmail.com", "UserTest6", "Credentials", true, "Private");
                await AddUserWithProfileAsync(userManager, context, roleManager, "usertest7@gmail.com", "UserTest7", "Credentials", true, "Private");

                await context.SaveChangesAsync();

                _isSeed = true;
            }
        }

        private async Task AddUserWithProfileAsync(UserManager<User> userManager, WatchersWorldServerContext context, RoleManager<IdentityRole> roleManager, string email, string userName, string provider, bool emailConfirmed, string profileStatus = "Public")
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

            if (roleManager != null)
            {
                var roleResult = await userManager.AddToRoleAsync(user, "User");
                if (!roleResult.Succeeded)
                {
                    throw new Exception("Failed to assign role to user: " + roleResult.Errors.FirstOrDefault()?.Description);
                }
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
