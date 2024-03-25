using Microsoft.AspNetCore.Identity;
using System;
using System.Collections.Generic;
using System.Linq;
using System.Text;
using System.Threading.Tasks;
using WatchersWorld.Server.Data;
using WatchersWorld.Server.DTOs.Media;
using WatchersWorld.Server.Models.Authentication;
using WatchersWorld.Server.Models.Media;
using WatchersWorld.Server.Services;

namespace WatchersWorld_Teste.FixtureConfiguration.SeedsConfiguration
{
    public class RatingMediaTestSeedConfiguration : ISeedConfiguration
    {
        private static bool _isSeed;
        private readonly IRatingMediaService _ratingMediaService;

        public RatingMediaTestSeedConfiguration(IRatingMediaService ratingMediaService)
        {
            _ratingMediaService = ratingMediaService;
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

                var user1 = await userManager.FindByNameAsync("UserTest1");
                var user2 = await userManager.FindByNameAsync("UserTest2");
                var user3 = await userManager.FindByNameAsync("UserTest3");

                UserMediaDto KungFuPanda4 = new()
                {
                    MediaId = 1011985,
                    Type = "movie"
                };
                UserMediaDto Damsel = new()
                {
                    MediaId = 763215,
                    Type = "movie"
                };
                UserMediaDto NoWayUp = new()
                {
                    MediaId = 1096197,
                    Type = "movie"
                };
                UserMediaDto Oppenheimer = new()
                {
                    MediaId = 872585,
                    Type = "movie"
                };
                MediaInfoModel Wonka = new()
                {
                    IdMedia = 787699,
                    Type = "movie"
                };

                await _ratingMediaService.GiveRatingToMedia(user1!.Id, KungFuPanda4, 5);
                await _ratingMediaService.GiveRatingToMedia(user1!.Id, Oppenheimer, 4);
                await _ratingMediaService.GiveRatingToMedia(user2!.Id, KungFuPanda4, 4);
                await _ratingMediaService.GiveRatingToMedia(user2!.Id, Damsel, 4);
                await _ratingMediaService.GiveRatingToMedia(user3!.Id, NoWayUp, 4);

                context.MediaInfoModel.Add(Wonka);

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
