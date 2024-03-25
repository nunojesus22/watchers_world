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
    public class FollowersTestSeedConfiguration : ISeedConfiguration
    {
        private static bool _isSeed;
        private readonly IFollowersService _followersService;

        public FollowersTestSeedConfiguration(IFollowersService followersService)
        {
            _followersService = followersService;
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

                var user1ToGetId = await userManager.FindByNameAsync("UserTest1");
                var user2ToGetId = await userManager.FindByNameAsync("UserTest2");
                var user3ToGetId = await userManager.FindByNameAsync("UserTest3");
                var user4ToGetId = await userManager.FindByNameAsync("UserTest4");
                var user5ToGetId = await userManager.FindByNameAsync("UserTest5");
                var user6ToGetId = await userManager.FindByNameAsync("UserTest6");
                var user7ToGetId = await userManager.FindByNameAsync("UserTest7");

                await _followersService.Follow(user1ToGetId!.Id, user2ToGetId!.Id);
                await _followersService.Follow(user1ToGetId!.Id, user3ToGetId!.Id);
                await _followersService.Follow(user2ToGetId!.Id, user3ToGetId!.Id);
                await _followersService.Follow(user2ToGetId!.Id, user4ToGetId!.Id);
                await _followersService.Follow(user3ToGetId!.Id, user1ToGetId!.Id);
                await _followersService.Follow(user1ToGetId!.Id, user6ToGetId!.Id);
                await _followersService.Follow(user2ToGetId!.Id, user6ToGetId!.Id);
                await _followersService.Follow(user3ToGetId!.Id, user6ToGetId!.Id);
                await _followersService.Follow(user4ToGetId!.Id, user6ToGetId!.Id);
                await _followersService.Follow(user1ToGetId!.Id, user7ToGetId!.Id);
                await _followersService.Follow(user2ToGetId!.Id, user7ToGetId!.Id);
                await _followersService.Follow(user3ToGetId!.Id, user7ToGetId!.Id);
                await _followersService.Follow(user4ToGetId!.Id, user7ToGetId!.Id);
                await _followersService.AcceptFollowSend(user6ToGetId!.Id, user1ToGetId!.Id);
                await _followersService.RejectFollowSend(user6ToGetId!.Id, user2ToGetId!.Id);

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
