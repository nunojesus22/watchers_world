using Microsoft.AspNetCore.Identity;
using WatchersWorld.Server.Data;
using WatchersWorld.Server.Models.Authentication;
using WatchersWorld.Server.Services;

namespace WatchersWorld_Teste.FixtureConfiguration
{
    public interface ISeedConfiguration
    {
        Task SeedAsync(UserManager<User> userManager, WatchersWorldServerContext context);
    }
}
