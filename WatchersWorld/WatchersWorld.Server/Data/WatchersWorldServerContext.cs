using Microsoft.AspNetCore.Identity;
using Microsoft.AspNetCore.Identity.EntityFrameworkCore;
using Microsoft.EntityFrameworkCore;
using System.Collections.Generic;
using WatchersWorld.Server.Models.Authentication;
using WatchersWorld.Server.Models.Followers;
using WatchersWorld.Server.Models.Media;
using WatchersWorld.Server.Models.Media.FavoriteActor;
using WatchersWorld.Server.Models.Media.RatingMedia;
using WatchersWorld.Server.Models.Media.Quiz;
using WatchersWorld.Server.Models.Media.Quiz.WatchersWorld.Server.Models.Media.Quiz;
using WatchersWorld.Server.Models.Notifications;

namespace WatchersWorld.Server.Data
{
    public class WatchersWorldServerContext(DbContextOptions<WatchersWorldServerContext> options) : IdentityDbContext<User>(options)
    {
        public new DbSet<User> Users { get; set; }
        public DbSet<ProfileInfo> ProfileInfo { get; set; }
        public DbSet<Followers> Followers { get; set; }
        public DbSet<MediaInfoModel> MediaInfoModel{ get; set; }
        public DbSet<MediaListModel> MediaListModel { get; set; }
        public DbSet<UserMedia> UserMedia{ get; set; }
        public DbSet<Actor> Actor { get; set; }
        public DbSet<ActorMedia> ActorMedia { get; set; }
        public DbSet<FavoriteActorChoice> FavoriteActorChoice { get; set; }
        public DbSet<UserRatingMedia> UserRatingMedia { get; set; }
        public DbSet<Comment> Comments { get; set; }

        public DbSet<CommentLike> CommentLikes { get; set; }
        public DbSet<CommentDislike> CommentDislikes { get; set; }

        public DbSet<QuizAttempt> QuizAttempts { get; set; }
        public DbSet<Notification> Notifications { get; set; }


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

            modelBuilder.Entity<MediaInfoModel>()
                .HasIndex(p => p.IdMedia)
                .IsUnique(true);

            modelBuilder.Entity<Actor>()
                .Property(a => a.ActorId)
                .ValueGeneratedNever();
           
        }
    }
}
 