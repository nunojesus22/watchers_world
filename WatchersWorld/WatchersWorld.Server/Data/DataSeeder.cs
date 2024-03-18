using Microsoft.AspNetCore.Identity;
using Microsoft.AspNetCore.Mvc;
using Microsoft.Identity.Client.Platforms.Features.DesktopOs.Kerberos;
using WatchersWorld.Server.Models.Authentication;

namespace WatchersWorld.Server.Data
{
    public class DataSeeder
    {


        public static async Task SeedData(WatchersWorldServerContext context, UserManager<User> userManager, RoleManager<IdentityRole>? roleManager)
        {
            // Seed roles
            if (roleManager != null)
            {
                await EnsureRolesAsync(roleManager);
            }

            // Seed the admin user
            await EnsureAdminUserAsync(userManager, roleManager);

            // Seed test users
            await SeedTestUser(context, userManager, roleManager);
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

        private static async Task EnsureAdminUserAsync(UserManager<User> userManager, RoleManager<IdentityRole>? roleManager)
        {
            string adminEmail = "admin@admin.com";
            string adminPassword = "Teste1234";

            var adminUser = await userManager.FindByEmailAsync(adminEmail);
            if (adminUser == null)
            {
                adminUser = new User
                {
                    UserName = adminEmail,
                    Email = adminEmail,
                    EmailConfirmed = true,
                    Provider = "Credentials",

                };

                var createUserResult = await userManager.CreateAsync(adminUser, adminPassword);
                if (createUserResult.Succeeded && roleManager != null)
                {
                    await userManager.AddToRoleAsync(adminUser, "Admin");
                }
            }
        }

        private static async Task SeedTestUser(WatchersWorldServerContext context, UserManager<User> userManager, RoleManager<IdentityRole> roleManager)
        {
            await AddUserWithProfileAsync(context, userManager, roleManager, "usertest1@gmail.com", "UserTest1", "google", true, "Public");
            await AddUserWithProfileAsync(context, userManager, roleManager, "usertest2@gmail.com", "UserTest2", "Credentials", true, "Public");
            await AddUserWithProfileAsync(context, userManager, roleManager, "usertest3@gmail.com", "UserTest3", "Credentials", true, "Public");
            await AddUserWithProfileAsync(context, userManager, roleManager, "usertest4@gmail.com", "UserTest4", "Credentials", true, "Public");
            await AddUserWithProfileAsync(context, userManager, roleManager, "usertest5@gmail.com", "UserTest5", "Credentials", true, "Private");
            await AddUserWithProfileAsync(context, userManager, roleManager, "usertest6@gmail.com", "UserTest6", "Credentials", true, "Private");
            await AddUserWithProfileAsync(context, userManager, roleManager, "usertest7@gmail.com", "UserTest7", "Credentials", true, "Private");
        }

        private static async Task AddUserWithProfileAsync(WatchersWorldServerContext context, UserManager<User>? userManager, RoleManager<IdentityRole> roleManager, string email, string userName, string provider, bool emailConfirmed, string profileStatus = "Public")
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
