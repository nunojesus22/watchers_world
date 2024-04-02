using Microsoft.AspNetCore.Identity.EntityFrameworkCore;
using Microsoft.EntityFrameworkCore;
using WatchersWorld.Server.Models.Authentication;
using WatchersWorld.Server.Models.Followers;
using WatchersWorld.Server.Models.Media;
using WatchersWorld.Server.Models.Media.FavoriteActor;
using WatchersWorld.Server.Models.Media.RatingMedia;
using WatchersWorld.Server.Models.Media.Quiz.WatchersWorld.Server.Models.Media.Quiz;
using WatchersWorld.Server.Models.Notifications;
using WatchersWorld.Server.Models.Gamification;
using WatchersWorld.Server.Chat.Models;
using Microsoft.AspNetCore.Identity;

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
        public DbSet<FollowNotification> FollowNotifications { get; set; }
        public DbSet<ReplyNotification> ReplyNotifications { get; set; }
        public DbSet<AchievementNotification> AchievementNotifications { get; set; }
        public DbSet<MessageNotification> MessageNotifications { get; set; }


        public DbSet<Medals> Medals { get; set; }
        public DbSet<UserMedal> UserMedals { get; set; }


        public DbSet<Chat.Models.Chat> Chats { get; set; }
        public DbSet<Messages> Messages { get; set; }
        public DbSet<MessageStatus> MessagesStatus { get; set; }
        public DbSet<MessagesVisibility> MessagesVisibility { get; set; }

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

            modelBuilder.Entity<Notification>()
                .ToTable("Notifications");

            modelBuilder.Entity<FollowNotification>()
                .ToTable("FollowNotifications");

            modelBuilder.Entity<ReplyNotification>()
                .ToTable("ReplyNotifications");

            modelBuilder.Entity<AchievementNotification>()
                 .ToTable("AchievementNotifications");


            modelBuilder.Entity<UserMedal>()
                .HasKey(um => new { um.UserName, um.MedalId });

            modelBuilder.Entity<UserMedal>()
                .HasOne(um => um.Profile)
                .WithMany(u => u.UserMedals)
                .HasForeignKey(um => um.UserName);

            modelBuilder.Entity<UserMedal>()
                .HasOne(um => um.Medal)
                .WithMany(m => m.UserMedals)
                .HasForeignKey(um => um.MedalId);

            modelBuilder.Entity<Chat.Models.Chat>(entity =>
            {
                entity.HasOne(chat => chat.User1) 
                    .WithMany() 
                    .HasForeignKey(chat => chat.User1Id)
                    .HasConstraintName("FK_Chat_User1")
                    .OnDelete(DeleteBehavior.Restrict);

                entity.HasOne(chat => chat.User2) 
                    .WithMany() 
                    .HasForeignKey(chat => chat.User2Id)
                    .HasConstraintName("FK_Chat_User2")
                    .OnDelete(DeleteBehavior.Restrict);
            });

            modelBuilder.Entity<MessageStatus>()
                    .HasOne(ms => ms.Message)
                    .WithMany()
                    .HasForeignKey(ms => ms.MessageId)
                    .OnDelete(DeleteBehavior.Restrict);

            modelBuilder.Entity<MessagesVisibility>(entity =>
            {
                entity.HasOne(mv => mv.Message)
                    .WithMany()
                    .HasForeignKey(mv => mv.MessageId)
                    .HasConstraintName("FK_MessageVisibility_Message")
                    .OnDelete(DeleteBehavior.Restrict);

                entity.HasOne(mv => mv.User)
                    .WithMany()
                    .HasForeignKey(mv => mv.UserId)
                    .HasConstraintName("FK_MessageVisibility_User")
                    .OnDelete(DeleteBehavior.Restrict);
            });
                    

        }
    }
}
 