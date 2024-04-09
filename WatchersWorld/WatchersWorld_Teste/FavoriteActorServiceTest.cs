using Microsoft.AspNetCore.Identity;
using System;
using System.Collections.Generic;
using System.Linq;
using System.Text;
using System.Threading.Tasks;
using WatchersWorld.Server.Services;
using WatchersWorld_Teste.FixtureConfiguration.SeedsConfiguration;
using WatchersWorld_Teste.FixtureConfiguration;
using WatchersWorld.Server.Models.Authentication;
using Microsoft.Extensions.DependencyInjection;
using WatchersWorld.Server.DTOs.Media;
using WatchersWorld.Server.Models.Media.FavoriteActor;

namespace WatchersWorld_Teste
{
    public class FavoriteActorServiceTest : IClassFixture<IntegrationTestsFixture>
    {
        private readonly FavoriteActorService _service;
        private readonly UserManager<User> _userManager;

        public FavoriteActorServiceTest(IntegrationTestsFixture fixture)
        {
            _userManager = fixture.UserManager;
            _service = fixture.ServiceProvider.GetRequiredService<FavoriteActorService>();
            fixture.ApplySeedAsync(new FavoriteActorTestSeedConfiguration(_service)).Wait();
        }

        [Fact]
        public async Task GetUserChoice_GetUserChoiceWhenMediaDoesntExist_ShoulReturnZero()
        {
            var user = await _userManager.FindByNameAsync("UserTest1");

            var result = await _service.GetUserChoice(user!.Id, 792307);

            Assert.Equal(0, result);
        }

        [Fact]
        public async Task GetUserChoice_GetUserChoiceWhenMediaDoesntHaveVotes_ShouldReturnZero()
        {
            var user = await _userManager.FindByNameAsync("UserTest1");

            var result = await _service.GetUserChoice(user!.Id, 787699);

            Assert.Equal(0, result);
        }

        [Fact]
        public async Task GetUserChoice_GetUserChoiceWhenUserChooseActor_ShouldReturnRigth()
        {
            var user = await _userManager.FindByNameAsync("UserTest1");

            var result = await _service.GetUserChoice(user!.Id, 872585);

            Assert.Equal(2037, result);
        }

        [Fact]
        public async Task GetChoicesForMedia_GetChoicesForMediaWhenMediaDoesntExists_ShouldReturnEmpty()
        {
            var result = await _service.GetChoicesForMedia(792307);

            Assert.Empty(result);
        }

        [Fact]
        public async Task GetChoicesForMedia_GetChoicesForMediaWhenMediaDoesntHaveVotes_ShouldReturnEmpty()
        {
            var result = await _service.GetChoicesForMedia(787699);

            Assert.Empty(result);
        }

        [Fact]
        public async Task GetChoiceForMedia_GetChoicesForMediaWhenMediaHaveVotes_ShouldReturnRigth()
        {
            var result = await _service.GetChoicesForMedia(872585);

            Assert.NotEmpty(result);
            Assert.Equal(2, result.Count);

            var cillianMurphy = result.FirstOrDefault(r => r.ActorId == 2037);
            Assert.NotNull(cillianMurphy);
            Assert.Equal(75, cillianMurphy.Percentage);

            var emilyBlunt = result.FirstOrDefault(r => r.ActorId == 5081);
            Assert.NotNull(emilyBlunt);
            Assert.Equal(25, emilyBlunt.Percentage);
        }

        [Fact]
        public async Task ChooseAnActor_ChooseAnActorOnMediaThatDidntChoose_ShouldReturnTrue()
        {
            var user = await _userManager.FindByNameAsync("UserTest1");
            
            var actors = new List<ActorDto>
            {
                new ActorDto { ActorId = 1356210, ActorName = "Millie Bobby Brown" },
                new ActorDto { ActorId = 5538, ActorName = "Ray Winstone" },
                new ActorDto { ActorId = 9780, ActorName = "Angela Bassett" },
            };

            var result = await _service.ChooseAnActor(user!.Id, 1356210, new UserMediaDto { MediaId = 763215, Type = "movie" }, actors);

            Assert.True(result);
        }

        [Fact]
        public async Task ChooseAnActor_ChooseAnActorOnMediaThatAlreadyChoose_ShouldReturnTrue()
        {
            var user = await _userManager.FindByNameAsync("UserTest1");

            var actors = new List<ActorDto>
            {
                new ActorDto { ActorId = 70851, ActorName = "Jack Black" },
                new ActorDto { ActorId = 1625558, ActorName = "Awkwafina" },
                new ActorDto { ActorId = 17419, ActorName = "Bryan Cranston" }
            };

            var result = await _service.ChooseAnActor(user!.Id, 1625558, new UserMediaDto { MediaId = 1011985, Type = "movie" }, actors);

            Assert.True(result);
        }


    }
}
