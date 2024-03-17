using Microsoft.AspNetCore.Identity;
using Microsoft.AspNetCore.Identity.EntityFrameworkCore;
using Microsoft.EntityFrameworkCore;
using WatchersWorld.Server.Models.Authentication;
using WatchersWorld.Server.Models.Followers;
using WatchersWorld.Server.Models.Media;

namespace WatchersWorld.Server.Data
{
    public class WatchersWorldServerContext : IdentityDbContext<User>
    {
        public new DbSet<User> Users { get; set; }
        public DbSet<ProfileInfo> ProfileInfo { get; set; }
        public DbSet<Followers> Followers { get; set; }
        public DbSet<MediaInfoModel> MediaInfoModel{ get; set; }
        public DbSet<MediaListModel> MediaListModel { get; set; }
        public DbSet<UserMedia> UserMedia{ get; set; }
        public DbSet<Comment> Comments { get; set; }

        public DbSet<CommentLike> CommentLikes { get; set; }
        public DbSet<CommentDislike> CommentDislikes { get; set; }


        public WatchersWorldServerContext(DbContextOptions<WatchersWorldServerContext> options)
        : base(options)
        {
        }

        protected override void OnModelCreating(ModelBuilder modelBuilder)
        {
            base.OnModelCreating(modelBuilder);

            modelBuilder.Entity<MediaListModel>().HasData(
            new MediaListModel { Id = 1, ListName = "Filmes" },
            new MediaListModel { Id = 2, ListName = "Séries" },
            new MediaListModel { Id = 3, ListName = "Ver Mais Tarde Series" },
            new MediaListModel { Id = 4, ListName = "Ver Mais Tarde Filmes" },
            new MediaListModel { Id = 5, ListName = "Favoritos" }
             );

        }
    }
}
 