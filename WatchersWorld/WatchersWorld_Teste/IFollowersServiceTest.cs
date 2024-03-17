using Microsoft.AspNetCore.Identity;
using Microsoft.Extensions.Logging;
using System;
using System.Collections.Generic;
using System.Linq;
using System.Text;
using System.Threading.Tasks;
using WatchersWorld.Server.Controllers;
using WatchersWorld.Server.Data;
using WatchersWorld.Server.Services;

namespace WatchersWorld_Teste
{
    public class IFollowersServiceTest : IClassFixture<IntegrationTestsFixture>, IAsyncLifetime
    {
        private readonly WatchersWorldServerContext _context;
        private readonly FollowersService _service;
        private readonly IntegrationTestsFixture _fixture;
        private readonly UserManager<WatchersWorld.Server.Models.Authentication.User> _userManager;

        public IFollowersServiceTest(IntegrationTestsFixture fixture)
        {
            _fixture = fixture;
            _context = fixture.Context;
            _userManager = fixture.UserManager;
            _service = new FollowersService(_context);
        }

        public async Task InitializeAsync()
        {
            await _fixture.SeedDatabaseForFollowersTestAsync();
        }

        public Task DisposeAsync()
        {
            return Task.CompletedTask;
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
        public async Task Follow_FollowSomeoneThatNotFollow_ShouldReturnTrue()
        {
            var user1 = await _userManager.FindByNameAsync("UserTest1");

            var user4 = await _userManager.FindByNameAsync("UserTest4");

            var result = await _service.Follow(user1!.Id, user4!.Id);

            Assert.True(result);
        }

        /* [Fact] 
        public async Task Follow_AfterFollowSomeoneThatNotFollowUpdateFollowingNumber_ShouldBeTrue()
        {
            var user1 = await _userManager.FindByNameAsync("UserTest1");
            var user1Id = user1!.Id;

            var user4 = await _userManager.FindByNameAsync("UserTest4");
            var user4Id = user4!.Id;

            var followersNumberOfUser1NBefore = _context.ProfileInfo.Where(p => p.UserId == user1Id)
                                                    .Select(p => p.Following)
                                                    .SingleOrDefault();

            Assert.Equal(2, followersNumberOfUser1NBefore);

            var result = await _service.Follow(user1Id, user4Id);
            Assert.True(result);

            var followersNumberOfUser1After = _context.ProfileInfo.Where(p => p.UserId == user1Id)
                                                    .Select(p => p.Following)
                                                    .SingleOrDefault();

            Assert.Equal(3, followersNumberOfUser1After);

        } */

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
            var user1 = await _userManager.FindByNameAsync("UserTest1");

            var user6 = await _userManager.FindByNameAsync("UserTest6");

            var result = await _service.Unfollow(user1!.Id, user6!.Id);

            Assert.False(result);
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
    }
}
