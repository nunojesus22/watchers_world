using Microsoft.AspNetCore.Identity.EntityFrameworkCore;
using Microsoft.EntityFrameworkCore;
using WatchersWorld.Server.Models.Authentication;

namespace WatchersWorld.Server.Data;

public class WatchersWorldServerContext : IdentityDbContext<User>
{
    public WatchersWorldServerContext(DbContextOptions<WatchersWorldServerContext> options)
        : base(options)
    {
    }
}
