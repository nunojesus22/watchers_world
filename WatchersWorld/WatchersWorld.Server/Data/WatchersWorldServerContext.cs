using Microsoft.AspNetCore.Identity;
using Microsoft.AspNetCore.Identity.EntityFrameworkCore;
using Microsoft.EntityFrameworkCore;
using WatchersWorld.Server.Models.Authentication;

namespace WatchersWorld.Server.Data
{
    public class WatchersWorldServerContext : IdentityDbContext<User>
    {
        public DbSet<User> Users { get; set; }
        public DbSet<ProfileInfo> ProfileInfo { get; set; }

        public WatchersWorldServerContext(DbContextOptions<WatchersWorldServerContext> options)
        : base(options)
        {
        }

        protected override void OnModelCreating(ModelBuilder modelBuilder)
        {
            base.OnModelCreating(modelBuilder);
            
        }
    }
}
 