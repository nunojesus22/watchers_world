using Microsoft.AspNetCore.Identity;
using System;
using System.Collections.Generic;
using System.Linq;
using System.Text;
using System.Threading.Tasks;
using WatchersWorld.Server.Data;
using WatchersWorld.Server.Models.Authentication;

namespace WatchersWorld_Teste.FixtureConfiguration
{
    public interface ISeedConfigurationAdmin
    {
        Task SeedAsync(UserManager<User> userManager, WatchersWorldServerContext context, RoleManager<IdentityRole> roleManager);

    }
}
