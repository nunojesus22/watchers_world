using Castle.Core.Logging;
using Microsoft.AspNetCore.Identity;
using Microsoft.Extensions.DependencyInjection;
using Microsoft.Extensions.Logging;
using WatchersWorld.Server.Controllers;
using WatchersWorld.Server.Data;
using WatchersWorld.Server.Services;

namespace WatchersWorld_Teste
{
    public class FollowersControllerTest : IClassFixture<IntegrationTestsFixture>, IAsyncLifetime
    {
        private readonly WatchersWorldServerContext _context;
        private readonly UserManager<WatchersWorld.Server.Models.Authentication.User> _userManager;
        private readonly ProfileController _profileController;
        private readonly IntegrationTestsFixture _fixture;

        public FollowersControllerTest(IntegrationTestsFixture fixture, ILogger<ProfileController> logger, IFollowersService service)
        {
            _fixture = fixture;
            _context = fixture.Context;
            _userManager = fixture.UserManager;
            _profileController = new ProfileController(_context, _userManager, logger, service);
        }

        public async Task InitializeAsync()
        {
            await _fixture.SeedDatabaseForFollowersTestAsync();
        }

        public Task DisposeAsync()
        {
            return Task.CompletedTask;
        }

    }
}
