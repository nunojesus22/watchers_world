using Microsoft.AspNetCore.Identity;
using Microsoft.Extensions.DependencyInjection;
using WatchersWorld.Server.Data;
using WatchersWorld.Server.DTOs.Media;
using WatchersWorld.Server.Models.Authentication;
using WatchersWorld.Server.Models.Media.RatingMedia;
using WatchersWorld.Server.Services;
using WatchersWorld_Teste.FixtureConfiguration;
using WatchersWorld_Teste.FixtureConfiguration.SeedsConfiguration;

namespace WatchersWorld_Teste
{
    
    public class IRatingMediaServiceTest : IClassFixture<IntegrationTestsFixture>
    {
        private readonly RatingMediaService _service;
        private readonly UserManager<User> _userManager;

        public IRatingMediaServiceTest(IntegrationTestsFixture fixture)
        {
            _userManager = fixture.UserManager;
            _service = fixture.ServiceProvider.GetRequiredService<RatingMediaService>();
            fixture.ApplySeedAsync(new RatingMediaTestSeedConfiguration(_service)).Wait();
        }

        [Fact]
        public async Task UserAlreadyGiveRating_UserAlreadyGiveRatingWhenAlreadyRate_ShouldReturnUserRatingMedia()
        {
            var user = await _userManager.FindByNameAsync("UserTest1");

            var result = await _service.UserAlreadyGiveRating(user!.Id, 1011985, "movie");

            Assert.IsType<UserRatingMedia>(result);
        }

        [Fact]
        public async Task UserAlreadyGiveRating_UserAlreadyGiveRatingWhenDoesntHaveRates_ShouldReturnNull()
        {
            var user = await _userManager.FindByNameAsync("UserTest1");

            var result = await _service.UserAlreadyGiveRating(user!.Id, 1096197, "movie");

            Assert.Null(result);
        }

        [Fact]
        public async Task MediaAlreadyOnDatabase_MediaAlreadyOnDatabaseWhenMediaAlreadyExists_ShouldReturnFalse()
        {
            var result = await _service.MediaAlreadyOnDatabase(1011985, "movie");
            Assert.True(result);
        }

        [Fact]
        public async Task MediaAlreadyOnDatabase_MediaAlreadyOnDatabaseWhenMediaDoesntExists_ShouldReturnFalse()
        {
            var result = await _service.MediaAlreadyOnDatabase(1072790, "movie");
            Assert.False(result);
        }

        [Fact]
        public async Task GetAverageRatingForMedia_GetAverageRatingForMediaThatDoesntExists_ShouldReturnZero()
        {
            var result = await _service.GetAverageRatingForMedia(1072790, "movie");

            Assert.Equal(0, result);
        }

        [Fact]
        public async Task GetAverageRatingForMedia_GetAverageRatingForMediaThatDoesntHaveRates_ShouldReturnZero()
        {
            var MadameWeb = new UserMediaDto
            {
                MediaId = 634492,
                Type = "movie"
            };

            await _service.AddMediaToDatabase(MadameWeb);

            var result = await _service.GetAverageRatingForMedia(1072790, "movie");

            Assert.Equal(0, result);
        }

        [Fact]
        public async Task GetAverageRatingForMedia_GetAverageRatingForMediaThatHaveRates_ShouldReturnRigth()
        {
            var result = await _service.GetAverageRatingForMedia(1011985, "movie");

            Assert.Equal(4.5, result);
        }

        [Fact]
        public async Task GetUserRate_GetUserRateWhenMediaDoesntExist_ShouldReturnZero()
        {
            var user = await _userManager.FindByNameAsync("UserTest1");

            var result = await _service.GetUserRate(user!.Id, 1072790, "movie");

            Assert.Equal(0, result);
        }

        [Fact]
        public async Task GetUserRate_GetUserRateWhenMediaDoesntHaveRates_ShouldReturnZero()
        {
            var CodePartII = new UserMediaDto
            {
                MediaId = 932420,
                Type = "movie"
            };

            await _service.AddMediaToDatabase(CodePartII);

            var user = await _userManager.FindByNameAsync("UserTest1");

            var result = await _service.GetUserRate(user!.Id, 932420, "movie");

            Assert.Equal(0, result);
        }

        [Fact]
        public async Task GetUserRate_GetUserRateWhenUserAlreadyRate_ShouldReturnRigth()
        {
            var user = await _userManager.FindByNameAsync("UserTest1");

            var result = await _service.GetUserRate(user!.Id, 1011985, "movie");

            Assert.Equal(5, result);
        }

        [Fact]
        public async Task GetRatesForMedia_GetRatesForMediaWhenMediaDoesntExist_ShouldReturnEmpty()
        {
            var result = await _service.GetRatesForMedia(1072790, "movie");

            Assert.Empty(result);
        }

        [Fact]
        public async Task GetRatesForMedia_GetRatesForMediaWhenMediaDoesntHaveRates_ShouldReturnEmpty()
        {
            var Migration = new UserMediaDto
            {
                MediaId = 940551,
                Type = "movie"
            };

            var result = await _service.GetRatesForMedia(940551, "movie");

            Assert.Empty(result);
        }

        [Fact]
        public async Task GetRatesForMedia_GetRatesForMediaWhenMediaHasVotes_ShouldReturnRigth()
        {
            var result = await _service.GetRatesForMedia(1011985, "movie");

            Assert.NotEmpty(result);
            Assert.Equal(2, result.Count);

            var ratingFive = result.FirstOrDefault(r => r.Rating == 5);
            Assert.NotNull(ratingFive);
            Assert.Equal(50, ratingFive.Percentage);

            var ratingFour = result.FirstOrDefault(r => r.Rating == 4);
            Assert.NotNull(ratingFour);
            Assert.Equal(50, ratingFour.Percentage);
        }

        [Fact]
        public async Task GiveRatingToMedia_GiveRatingToMediaWhenRatingIs0_ShouldReturnFalse()
        {
            var user = await _userManager.FindByNameAsync("UserTest1");

            var result = await _service.GiveRatingToMedia(user!.Id, new UserMediaDto
            {
                MediaId = 1011985,
                Type = "movie"
            }, 0);

            Assert.False(result);
        }

        [Fact]
        public async Task GiveRatingToMedia_GiveRatingToMediaWhenMediaDoesntExist_ShouldReturnFalse()
        {
            var user = await _userManager.FindByNameAsync("UserTest1");

            var result = await _service.GiveRatingToMedia(user!.Id, new UserMediaDto
            {
                MediaId = 792307,
                Type = "movie"
            }, 5);

            Assert.True(result);
        }

        [Fact]
        public async Task GiveRatingToMedia_GiveRatingToMediaWhenMediaDoesntHaveVoted_ShouldReturnFalse()
        {
            var user = await _userManager.FindByNameAsync("UserTest1");

            var result = await _service.GiveRatingToMedia(user!.Id, new UserMediaDto
            {
                MediaId = 787699,
                Type = "movie"
            }, 5);

            Assert.True(result);
        }

        [Fact]
        public async Task GiveRatingToMedia_GiveRatingToMediaWhenAlreadyVoted_ShouldReturnTrue()
        {
            var user = await _userManager.FindByNameAsync("UserTest1");

            var beforeTest = await _service.GetUserRate(user!.Id, 872585, "movie");
            Assert.Equal(4, beforeTest);

            var result = await _service.GiveRatingToMedia(user!.Id, new UserMediaDto
            {
                MediaId = 872585,
                Type = "movie"
            }, 5);

            Assert.True(result);

            var afterTest = await _service.GetUserRate(user!.Id, 872585, "movie");
            Assert.Equal(5, afterTest);
        }
    }
    
}
