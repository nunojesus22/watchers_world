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

namespace WatchersWorld.Tests
{
    public class AdminControllerTest : IClassFixture<IntegrationTestsFixture>
    {
        private readonly UserManager<User> _userManager;
        private readonly EmailService _emailService;
        private readonly WatchersWorldServerContext _context;
        private readonly AdminController _adminController;
        private readonly IProfileService _profileService;


        public AdminControllerTest(IntegrationTestsFixture fixture)
        {
            _userManager = fixture.UserManager;
            var logger = fixture.ServiceProvider.GetRequiredService<ILogger<AccountController>>();
            _context = fixture.Context;
            _emailService = fixture.ServiceProvider.GetRequiredService<EmailService>();
            _adminController = new AdminController(_userManager, _emailService, _context, logger);
            _profileService = fixture.ProfileService;

        }

        [Fact]
        public async Task BanUserPermanently_UserExists_ShouldBanPermanently()
        {
            // Arrange
            var user = await _userManager.FindByNameAsync("UserTest1");
            var profileDto = await _profileService.GetUserProfileAsync(user!.UserName);

            // Act
            await _adminController.BanUserPermanently(user.UserName);

            // Assert
            Assert.NotNull(profileDto.StartBanDate);
            Assert.NotNull(profileDto.EndBanDate);
        }
    }
}
