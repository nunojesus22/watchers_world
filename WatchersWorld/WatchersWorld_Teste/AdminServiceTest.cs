using Microsoft.AspNetCore.Mvc;
using System.Threading.Tasks;
using Xunit;
using Moq;
using Microsoft.AspNetCore.Identity;
using System;
using WatchersWorld.Server.Models.Authentication;
using WatchersWorld.Server.Data;
using Microsoft.Extensions.Logging;
using WatchersWorld.Server.Controllers;
using WatchersWorld.Server.Services;
using WatchersWorld_Teste.FixtureConfiguration;
using Castle.Core.Configuration;
using Microsoft.Extensions.DependencyInjection;
using Microsoft.EntityFrameworkCore;
using WatchersWorld_Teste.FixtureConfiguration.SeedsConfiguration;
using WatchersWorld.Server.Chat.Services;

namespace WatchersWorld.Tests
{
    public class AdminServiceTest : IClassFixture<IntegrationTestsFixture>
    {
        private readonly IAdminService _adminService;
        private readonly UserManager<User> _userManager;
        private readonly WatchersWorldServerContext _context;


        public AdminServiceTest(IntegrationTestsFixture fixture)
        {
            _userManager = fixture.UserManager;
            _adminService = fixture.AdminService;
            _context = fixture.Context;
            fixture.ApplySeedAdminAsync(new AdminTestSeedConfiguration(fixture.AdminService)).Wait();
        }

        [Fact]
        public async Task BanUserPermanently_UserExists_ShouldBanPermanently()
        {
            // Arrange
            var user = await _context.ProfileInfo.FirstOrDefaultAsync(p => p.UserName == "UserTest1");

            // Act
            await _adminService.BanUserPermanentlyAsync(user.UserName);

            // Assert
            Assert.NotNull(user.StartBanDate);
            Assert.NotNull(user.EndBanDate);
        }

        [Fact]
        public async Task BanUserTemporarily_UserExists_ShouldBanTemporarily()
        {
            // Arrange
            var user = await _context.ProfileInfo.FirstOrDefaultAsync(p => p.UserName == "UserTest2");

            // Act
            var result = await _adminService.BanUserTemporarilyAsync(user.UserName, 2);

            // Assert
            
            Assert.Equal("User banned temporarily for 2 days.", result);
            Assert.NotNull(user.StartBanDate);
            Assert.NotNull(user.EndBanDate);
        }

        [Fact]
        public async Task UnbanUser_UserExists_ShouldUnbanUser()
        {
            // Arrange
            var user = await _context.ProfileInfo.FirstOrDefaultAsync(p => p.UserName == "UserTest3");
            // Ensure the user is banned before unbanning for the test
            await _adminService.BanUserPermanentlyAsync(user.UserName);

            // Act
            var result = await _adminService.UnbanUserAsync(user.UserName);

            // Assert
            Assert.Equal("User unbanned successfully.", result);
            Assert.Null(user.StartBanDate);
            Assert.Null(user.EndBanDate);
        }

        [Fact]
        public async Task DeleteUserByUsername_UserExists_ShouldDeleteUser()
        {
            // Arrange
            var user = await _context.ProfileInfo.FirstOrDefaultAsync(p => p.UserName == "UserTest4");
            Assert.NotNull(user); // Ensure the user exists before attempting delete

            // Act
            var result = await _adminService.DeleteUserByUsernameAsync(user.UserName);

            // Re-fetch the user from the database to get the current state
            var userAfterDelete = await _context.Users.FirstOrDefaultAsync(u => u.UserName == user.UserName);

            // Assert
            Assert.Equal("User and profile info successfully deleted.", result);
            Assert.Null(userAfterDelete); // Verify the user is not found after the operation
        }


        [Fact]
        public async Task ChangeRoleToModerator_UserExists_ShouldChangeRoleToModerator()
        {
            // Arrange
            var user = await _context.ProfileInfo.FirstOrDefaultAsync(p => p.UserName == "UserTest5");

            // Act
            var result = await _adminService.ChangeRoleToModeratorAsync(user.UserName);

            // Assert
            var roles = await _userManager.GetRolesAsync(await _userManager.FindByNameAsync(user.UserName));
            Assert.Equal("User role updated to Moderator successfully.", result);
            Assert.Contains("Moderator", roles);
        }

        [Fact]
        public async Task ChangeRoleToUser_UserExists_ShouldChangeRoleToUser()
        {
            // Arrange
            var user = await _context.ProfileInfo.FirstOrDefaultAsync(p => p.UserName == "UserTest6");
            var userRole = await _userManager.FindByNameAsync(user.UserName);


            // Make sure the user has a different role before changing to "User"
            await _adminService.ChangeRoleToModeratorAsync(user.UserName);

            // Act
            var result = await _adminService.ChangeRoleToUserAsync(user.UserName);

            // Assert
            var roles = await _userManager.GetRolesAsync(userRole);
            Assert.Equal("User role updated to User successfully.", result);
            Assert.Contains("User", roles);
            Assert.DoesNotContain("Moderator", roles);
        }
    }
}
