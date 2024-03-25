using Microsoft.AspNetCore.Identity;
using Microsoft.EntityFrameworkCore;
using System;
using System.Collections.Generic;
using System.Linq;
using System.Text;
using System.Threading.Tasks;
using WatchersWorld.Server.Data;
using WatchersWorld.Server.DTOs.Media;
using WatchersWorld.Server.Models.Authentication;
using WatchersWorld.Server.Models.Media;
using WatchersWorld.Server.Models.Media.FavoriteActor;
using WatchersWorld.Server.Services;

namespace WatchersWorld_Teste.FixtureConfiguration.SeedsConfiguration
{
    public class FavoriteActorTestSeedConfiguration : ISeedConfiguration
    {
        private static bool _isSeed;
        private readonly IFavoriteActorService _favoriteActorService;

        public FavoriteActorTestSeedConfiguration(IFavoriteActorService favoriteActorService)
        {
            _favoriteActorService = favoriteActorService;
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
                var user4 = await userManager.FindByNameAsync("UserTest4");

                List<MediaInfoModel> mediaInfoList = new List<MediaInfoModel>
                {
                    new MediaInfoModel { IdMedia = 1011985, Type = "movie" }, //KungFuPanda4
                    new MediaInfoModel { IdMedia = 763215, Type = "movie" }, //Damsel
                    new MediaInfoModel { IdMedia = 1096197, Type = "movie" }, //NoWayUp
                    new MediaInfoModel { IdMedia = 872585, Type = "movie" }, //Oppenheimer
                    new MediaInfoModel { IdMedia = 787699, Type = "movie" } //Wonka
                };

                List<Actor> actors = new List<Actor>
                {
                    new Actor { ActorId = 70851, ActorName = "Jack Black" },
                    new Actor { ActorId = 1625558, ActorName = "Awkwafina" },
                    new Actor { ActorId = 17419, ActorName = "Bryan Cranston" },
                    new Actor { ActorId = 1356210, ActorName = "Millie Bobby Brown" },
                    new Actor { ActorId = 5538, ActorName = "Ray Winstone" },
                    new Actor { ActorId = 9780, ActorName = "Angela Bassett" },
                    new Actor { ActorId = 2613589, ActorName = "Sophie McIntosh" },
                    new Actor { ActorId = 1461462, ActorName = "Will Attenborough" },
                    new Actor { ActorId = 3031970, ActorName = "Jeremias Amoore" },
                    new Actor { ActorId = 2037, ActorName = "Cillian Murphy" },
                    new Actor { ActorId = 5081, ActorName = "Emily Blunt" },
                    new Actor { ActorId = 1892, ActorName = "Matt Damon" },
                    new Actor { ActorId = 1190668, ActorName = "Timothée Chalamet" },
                    new Actor { ActorId = 1939373, ActorName = "Calah Lane" },
                    new Actor { ActorId = 298410, ActorName = "Keegan-Michael Key" }
                };

                context.MediaInfoModel.AddRange(mediaInfoList);
                context.Actor.AddRange(actors);
                await context.SaveChangesAsync();

                var idTableMediaKungFu = await context.MediaInfoModel.Where(mim => mim.IdMedia == 1011985).SingleAsync();
                var idTableMediaDamsel = await context.MediaInfoModel.Where(mim => mim.IdMedia == 763215).SingleAsync();
                var idTableMediaNoWayUp = await context.MediaInfoModel.Where(mim => mim.IdMedia == 1096197).SingleAsync();
                var idTableMediaOppenheimer = await context.MediaInfoModel.Where(mim => mim.IdMedia == 872585).SingleAsync();
                var idTableMediaWonka = await context.MediaInfoModel.Where(mim => mim.IdMedia == 787699).SingleAsync();

                List<ActorMedia> actorMedias = new List<ActorMedia>
                {
                    new ActorMedia {ActorId = 70851, IdTableMedia = idTableMediaKungFu.IdTableMedia},
                    new ActorMedia {ActorId = 1625558, IdTableMedia = idTableMediaKungFu.IdTableMedia},
                    new ActorMedia {ActorId = 17419, IdTableMedia = idTableMediaKungFu.IdTableMedia},
                    new ActorMedia {ActorId = 1356210, IdTableMedia = idTableMediaDamsel.IdTableMedia},
                    new ActorMedia {ActorId = 5538, IdTableMedia = idTableMediaDamsel.IdTableMedia},
                    new ActorMedia {ActorId = 9780, IdTableMedia = idTableMediaDamsel.IdTableMedia},
                    new ActorMedia {ActorId = 2613589, IdTableMedia = idTableMediaNoWayUp.IdTableMedia},
                    new ActorMedia {ActorId = 1461462, IdTableMedia = idTableMediaNoWayUp.IdTableMedia},
                    new ActorMedia {ActorId = 3031970, IdTableMedia = idTableMediaNoWayUp.IdTableMedia},
                    new ActorMedia {ActorId = 2037, IdTableMedia = idTableMediaOppenheimer.IdTableMedia},
                    new ActorMedia {ActorId = 5081, IdTableMedia = idTableMediaOppenheimer.IdTableMedia},
                    new ActorMedia {ActorId = 1892, IdTableMedia = idTableMediaOppenheimer.IdTableMedia},
                    new ActorMedia {ActorId = 1190668, IdTableMedia = idTableMediaWonka.IdTableMedia},
                    new ActorMedia {ActorId = 1939373, IdTableMedia = idTableMediaWonka.IdTableMedia},
                    new ActorMedia {ActorId = 298410, IdTableMedia = idTableMediaWonka.IdTableMedia},
                };

                context.ActorMedia.AddRange(actorMedias);
                await context.SaveChangesAsync();

                var cillianMurphyOnOppenheimer = await context.ActorMedia.Where(am => am.ActorId == 2037 && am.IdTableMedia == idTableMediaOppenheimer.IdTableMedia).SingleAsync();
                var emilyBluntOnOppenheimer = await context.ActorMedia.Where(am => am.ActorId == 5081 && am.IdTableMedia == idTableMediaOppenheimer.IdTableMedia).SingleAsync();
                var awkwafinaOnKungFu = await context.ActorMedia.Where(am => am.ActorId == 70851 && am.IdTableMedia == idTableMediaKungFu.IdTableMedia).SingleAsync();

                context.FavoriteActorChoice.Add(new FavoriteActorChoice { UserThatChooseId = user1!.Id, ActorMediaId = cillianMurphyOnOppenheimer.Id});
                context.FavoriteActorChoice.Add(new FavoriteActorChoice { UserThatChooseId = user2!.Id, ActorMediaId = cillianMurphyOnOppenheimer.Id });
                context.FavoriteActorChoice.Add(new FavoriteActorChoice { UserThatChooseId = user3!.Id, ActorMediaId = cillianMurphyOnOppenheimer.Id });
                context.FavoriteActorChoice.Add(new FavoriteActorChoice { UserThatChooseId = user4!.Id, ActorMediaId = emilyBluntOnOppenheimer.Id });
                context.FavoriteActorChoice.Add(new FavoriteActorChoice { UserThatChooseId = user1!.Id, ActorMediaId = awkwafinaOnKungFu.Id });

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
