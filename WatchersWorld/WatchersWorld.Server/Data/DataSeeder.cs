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
            var (userTest1, profileTest1) = CreateUserTest("testeusername1", "test1@example.com");
            var (userTest2, profileTest2) = CreateUserTest("testeusername2", "test2@example.com");
            var (userTest3, profileTest3) = CreateUserTest("testeusername3", "test3@example.com");
            var (userTest4, profileTest4) = CreateUserTest("testeusername4", "test4@example.com");
            var (userTest5, profileTest5) = CreateUserTest("testeusername5", "test5@example.com");

            var result1 = await userManager.CreateAsync(userTest1, "userTest1");
            var result2 = await userManager.CreateAsync(userTest2, "userTest2");
            var result3 = await userManager.CreateAsync(userTest3, "userTest3");
            var result4 = await userManager.CreateAsync(userTest4, "userTest4");
            var result5 = await userManager.CreateAsync(userTest5, "userTest5");

            if (result1.Succeeded && result2.Succeeded && result3.Succeeded && result4.Succeeded && result5.Succeeded)
            {
                context.ProfileInfo.Add(profileTest1);
                context.ProfileInfo.Add(profileTest2);
                context.ProfileInfo.Add(profileTest3);
                context.ProfileInfo.Add(profileTest4);
                context.ProfileInfo.Add(profileTest5);
                await context.SaveChangesAsync();
            }
        }

        private static (User user, ProfileInfo profile) CreateUserTest(string username, string email)
        {
            var userTest = new User
            {
                UserName = username,
                Email = email,
                EmailConfirmed = true,
                Provider = "Credentials"
            };

            var profileInfoTest1 = new ProfileInfo
            {
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

            return (userTest, profileInfoTest1);
        }

    }
}
