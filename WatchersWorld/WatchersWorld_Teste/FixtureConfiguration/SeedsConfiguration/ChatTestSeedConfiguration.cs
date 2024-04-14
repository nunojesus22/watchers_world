using Microsoft.AspNetCore.Identity;
using System;
using System.Collections.Generic;
using System.Linq;
using System.Text;
using System.Threading.Tasks;
using WatchersWorld.Server.Data;
using WatchersWorld.Server.Models.Authentication;
using WatchersWorld.Server.Models.Media.FavoriteActor;
using WatchersWorld.Server.Models.Media;
using WatchersWorld.Server.Services;
using WatchersWorld.Server.Models.Chat;

namespace WatchersWorld_Teste.FixtureConfiguration.SeedsConfiguration
{
    public class ChatTestSeedConfiguration : ISeedConfiguration
    {
        private static bool _isSeed;
        private readonly IChatService _chatService;

        public ChatTestSeedConfiguration(IChatService chatService)
        {
            _chatService = chatService;
        }

        public async Task SeedAsync(UserManager<User> userManager, WatchersWorldServerContext context)
        {
            if (!_isSeed)
            {
                await AddUserWithProfileAsync(userManager, context, "usertest1@gmail.com", "UserTest1", "google", true, "Public");
                await AddUserWithProfileAsync(userManager, context, "usertest2@gmail.com", "UserTest2", "Credentials", true, "Public");
                await AddUserWithProfileAsync(userManager, context, "usertest3@gmail.com", "UserTest3", "Credentials", true, "Public");
                await AddUserWithProfileAsync(userManager, context, "usertest4@gmail.com", "UserTest4", "Credentials", true, "Public");
                await AddUserWithProfileAsync(userManager, context, "usertest5@gmail.com", "UserTest5", "Credentials", true, "Private");
                await AddUserWithProfileAsync(userManager, context, "usertest6@gmail.com", "UserTest6", "Credentials", true, "Private");
                await AddUserWithProfileAsync(userManager, context, "usertest7@gmail.com", "UserTest7", "Credentials", true, "Private");
                await AddUserWithProfileAsync(userManager, context, "usertest8@gmail.com", "UserTest8", "Credentials", true, "Public");

                var user1 = await userManager.FindByNameAsync("UserTest1");
                var user2 = await userManager.FindByNameAsync("UserTest2");
                var user3 = await userManager.FindByNameAsync("UserTest3");
                var user4 = await userManager.FindByNameAsync("UserTest4");

                List<Chat> chats = new()
                {
                    new Chat { User1Id = user1!.Id,  User2Id = user2!.Id,  CreatedAt = DateTime.UtcNow },
                    new Chat { User1Id = user1!.Id,  User2Id = user3!.Id,  CreatedAt = DateTime.UtcNow },
                    new Chat { User1Id = user2!.Id,  User2Id = user3!.Id,  CreatedAt = DateTime.UtcNow },
                    new Chat { User1Id = user2!.Id,  User2Id = user4!.Id,  CreatedAt = DateTime.UtcNow },
                };

                context.Chats.AddRange(chats);

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
