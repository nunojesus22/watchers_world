using Microsoft.AspNetCore.Identity;
using WatchersWorld.Server.Data;
using WatchersWorld.Server.Services;
using WatchersWorld.Server.Models.Authentication;
using WatchersWorld_Teste.FixtureConfiguration.SeedsConfiguration;
using WatchersWorld_Teste.FixtureConfiguration;

namespace WatchersWorld_Teste
{
    public class FollowersServiceTest : IClassFixture<IntegrationTestsFixture>
    {
        //private readonly WatchersWorldServerContext _context;
        private readonly IFollowersService _service;
        private readonly UserManager<User> _userManager;

        public FollowersServiceTest(IntegrationTestsFixture fixture)
        {
            //_context = fixture.Context;
            _userManager = fixture.UserManager;
            _service = fixture.FollowersService;
            fixture.ApplySeedAsync(new FollowersTestSeedConfiguration(fixture.FollowersService)).Wait();
        }

        [Fact]
        public async Task Follow_FollowYourself_ShouldReturnFalse()
        {
            var user = await _userManager.FindByNameAsync("UserTest1");

            var result = await _service.Follow(user!.Id, user!.Id);

            Assert.False(result);
        }

        [Fact]
        public async Task Follow_FollowSomeoneThatAlreadyFollow_ShouldReturnFalse()
        {
            var user1 = await _userManager.FindByNameAsync("UserTest1");

            var user2 = await _userManager.FindByNameAsync("UserTest2");

            var result = await _service.Follow(user1!.Id, user2!.Id);

            Assert.False(result);
        }

        [Fact]
        public async Task Follow_FollowSomeoneThatIsPending_ShouldReturnFalse()
        {
            var user3 = await _userManager.FindByNameAsync("UserTest3");

            var user6 = await _userManager.FindByNameAsync("UserTest6");

            var result = await _service.Follow(user3!.Id, user6!.Id);
            Assert.False(result);
        }

        [Fact]
        public async Task Follow_FollowSomeoneThatNotFollowAndThatHavePublicProfile_ShouldReturnTrueAndShouldNotBePending()
        {
            var user1 = await _userManager.FindByNameAsync("UserTest1");

            var user4 = await _userManager.FindByNameAsync("UserTest4");

            var result = await _service.Follow(user1!.Id, user4!.Id);
            Assert.True(result);

            var isPending = await _service.FollowIsPending(user1!.Id, user4.Id);
            Assert.False(isPending);
        }

        [Fact]
        public async Task Follow_FollowSomeoneThatNotFollowAndHavePrivateProfile_ShouldReturnTrueAndMustBePending()
        {
            var user1 = await _userManager.FindByNameAsync("UserTest1");

            var user5 = await _userManager.FindByNameAsync("UserTest5");

            var result = await _service.Follow(user1!.Id, user5!.Id);
            Assert.True(result);

            var isPending = await _service.FollowIsPending(user1!.Id, user5.Id);
            Assert.True(isPending);
        }

        [Fact]
        public async Task Unfollow_UnfollowYourself_ShouldReturnFalse()
        {
            var user = await _userManager.FindByNameAsync("UserTest1");

            var result = await _service.Unfollow(user!.Id, user!.Id);

            Assert.False(result);
        }

        [Fact]
        public async Task Unfollow_UnfollowSomeoneThatNotFollow_ShouldReturnFalse()
        {
            var user3 = await _userManager.FindByNameAsync("UserTest3");

            var user4 = await _userManager.FindByNameAsync("UserTest4");

            var result = await _service.Unfollow(user3!.Id, user4!.Id);

            Assert.False(result);
        }

        [Fact]
        public async Task Unfollow_UnfollowSomeoneThatFollowIsPending_ShouldReturnTrue()
        {
            var user3= await _userManager.FindByNameAsync("UserTest3");

            var user6 = await _userManager.FindByNameAsync("UserTest6");

            var result = await _service.Unfollow(user3!.Id, user6!.Id);

            Assert.True(result);
        }

        [Fact]
        public async Task Unfollow_UnfollowSomeoneThatFollow_ShouldReturnTrue()
        {
            var user1 = await _userManager.FindByNameAsync("UserTest1");

            var user3 = await _userManager.FindByNameAsync("UserTest3");

            var result = await _service.Unfollow(user1!.Id, user3!.Id);

            Assert.True(result);
        }

        [Fact]
        public async Task GetFollowers_GetFollowersReturnsListWithCorrectLenghtAndCorrectId_ShouldBeTrue()
        {
            var user1 = await _userManager.FindByNameAsync("UserTest1");
            var user3 = await _userManager.FindByNameAsync("UserTest3");

            var result = await _service.GetFollowers(user1!.Id);

            var listContainsUser3 = result.Contains(user3!.Id);

            Assert.True(listContainsUser3);
            Assert.Single(result);
        }

        [Fact]
        public async Task GetWhoFollow_GetWhoFollowReturnsListWithCorrectLenghtAndCorrectId_ShouldBeTrue()
        {
            var user2 = await _userManager.FindByNameAsync("UserTest2");
            var user3 = await _userManager.FindByNameAsync("UserTest3");
            var user4 = await _userManager.FindByNameAsync("UserTest4");

            var result = await _service.GetWhoFollow(user2!.Id);

            var listContainsUser3 = result.Contains(user3!.Id);
            var listContainsUser4 = result.Contains(user4!.Id);

            Assert.True(listContainsUser3);
            Assert.True(listContainsUser4);
            Assert.Equal(2, result.Count);
        }

        [Fact]
        public async Task AlreadyFollow_AlreadyFollowWhenUserDontFollowOtherUser_ShouldReturnFalse()
        {
            var user1 = await _userManager.FindByNameAsync("UserTest1");
            var user5 = await _userManager.FindByNameAsync("UserTest5");

            var alreadyFollow = await _service.AlreadyFollow(user1!.Id, user5!.Id);

            Assert.False(alreadyFollow);
        }

        [Fact]
        public async Task AlreadyFollow_AlreadyFollowWhenUserFollowOtherUser_ShouldReturnTrue()
        {
            var user1 = await _userManager.FindByNameAsync("UserTest1");
            var user2 = await _userManager.FindByNameAsync("UserTest2");

            var alreadyFollow = await _service.AlreadyFollow(user1!.Id, user2!.Id);

            Assert.True(alreadyFollow);
        }

        [Fact]
        public async Task AcceptFollowSend_AcceptFollowSendWhenIsPending_ShouldReturnTrue()
        {
            var user6 = await _userManager.FindByNameAsync("UserTest6");
            var user1 = await _userManager.FindByNameAsync("UserTest3");

            var result = await _service.AcceptFollowSend(user6!.Id, user1!.Id);
            Assert.True(result);
        }

        [Fact]
        public async Task RejectFollowSend_RejectFollowSendWhenIsPending_ShouldReturnTrue()
        {
            var user6 = await _userManager.FindByNameAsync("UserTest6");
            var user4 = await _userManager.FindByNameAsync("UserTest4");

            var result = await _service.AcceptFollowSend(user6!.Id, user4!.Id);
            Assert.True(result);
        }

        [Fact]
        public async Task GetPendingsSend_GetPendingsSendReturnsListWithCorrectLenghtAndCorrectId_ShouldBeTrue()
        {
            var user7 = await _userManager.FindByNameAsync("UserTest7");
            var user3 = await _userManager.FindByNameAsync("UserTest3");
            var user4 = await _userManager.FindByNameAsync("UserTest4");

            var result = await _service.GetPendingsSend(user7!.Id);

            var listContainsUser3 = result.Contains(user3!.Id);
            var listContainsUser4 = result.Contains(user4!.Id);

            Assert.True(listContainsUser3);
            Assert.True(listContainsUser4);
            Assert.Equal(4, result.Count);
        }
    }


}
