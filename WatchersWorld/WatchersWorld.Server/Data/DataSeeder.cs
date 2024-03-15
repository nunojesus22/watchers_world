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
            await CreateUserTest("userTest1", "test1@gmail.com", context, userManager);
            await CreateUserTest("userTest2", "test2@gmail.com", context, userManager);
            await CreateUserTest("userTest3", "test3@gmail.com", context, userManager);
            await CreateUserTest("userTest4", "test4@gmail.com", context, userManager);
            await CreateUserTest("userTest5", "test5@gmail.com", context, userManager);
            await CreateUserTest("userTest6", "test6@gmail.com", context, userManager);
        }

        private static async Task<bool> CreateUserTest(string username, string email, WatchersWorldServerContext context, UserManager<User> userManager)
        {
            var userTest = new User
            {
                UserName = username,
                Email = email,
                EmailConfirmed = true,
                Provider = "Credentials"
            };

            var result = await userManager.CreateAsync(userTest, username);
            if(result.Succeeded)
            {
                var user = await userManager.FindByNameAsync(username);
                var profileInfoTest1 = new ProfileInfo
                {
                    UserId = user.Id,
                    UserName = userTest.UserName,
                    Description = "Por definir!",
                    Gender = 'M',
                    BirthDate = DateTime.Now,
                    ProfileStatus = "Public",
                    ProfilePhoto = "assets/img/joao-pfp.png",
                    CoverPhoto = "assets/img/pfp2.png",
                    Following = 0,
                    Followers = 0
                };
                
                try
                {
                    context.ProfileInfo.Add(profileInfoTest1);
                    await context.SaveChangesAsync();
                } catch (Exception ex)
                {
                    Console.WriteLine(ex.ToString());
                    return false;
                }

                return true;
            }

            return false;
        }

    }
}
