using Microsoft.AspNetCore.Identity;
using Microsoft.AspNetCore.Identity.EntityFrameworkCore;
using Microsoft.EntityFrameworkCore;
using WatchersWorld.Server.Models;
using WatchersWorld.Server.Models.Authentication;
using WatchersWorld.Server.Models.Media;
using WatchersWorld.Server.Models.Quiz;

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
        public DbSet<QuizOption> QuizOption { get; set; }
        public DbSet<QuizQuestion> QuizQuestion { get; set; }
        public DbSet<QuizQuestionsGroup> QuizQuestionsGroup { get; set; }
        public DbSet<QuizQuestions> QuizQuestions { get; set; }
        public DbSet<QuizYears> QuizYears { get; set; }
        public DbSet<QuizCategorys> QuizCategorys { get; set; }
        public DbSet<QuizNames> QuizNames { get; set; }



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


            modelBuilder.Entity<QuizYears>().HasData(
            new QuizYears { Id = 1, name = "2010" },
            new QuizYears { Id = 2, name = "2100" },
            new QuizYears { Id = 3, name = "1600" },
            new QuizYears { Id = 4, name = "3010" },
            new QuizYears { Id = 5, name = "2102" }
             );


            modelBuilder.Entity<QuizCategorys>().HasData(
            new QuizCategorys { Id = 1, name = "Horror" },
            new QuizCategorys { Id = 2, name = "Terror" },
            new QuizCategorys { Id = 3, name = "Comedy" },
            new QuizCategorys { Id = 4, name = "Adventure" },
            new QuizCategorys { Id = 5, name = "Animation" },
            new QuizCategorys { Id = 6, name = "Drama" },
            new QuizCategorys { Id = 7, name = "Thriller" },
            new QuizCategorys { Id = 8, name = "Crime" },
            new QuizCategorys { Id = 9, name = "Television" },
            new QuizCategorys { Id = 10, name = "Western" },
            new QuizCategorys { Id = 11, name = "Romance" },
            new QuizCategorys { Id = 12, name = "Science fiction" },
            new QuizCategorys { Id = 13, name = "Fantasy" },
            new QuizCategorys { Id = 14, name = "Historical" },
            new QuizCategorys { Id = 15, name = "Documentary" },
            new QuizCategorys { Id = 16, name = "Musical" },
            new QuizCategorys { Id = 17, name = "Science" },
            new QuizCategorys { Id = 18, name = "War" },
            new QuizCategorys { Id = 19, name = "Cyberpunk" },
            new QuizCategorys { Id = 20, name = "Short" }

             );


            modelBuilder.Entity<QuizNames>().HasData(
            new QuizNames { Id = 1, name = "Martin Luther" },
            new QuizNames { Id = 2, name = "Albert Einstein" },
            new QuizNames { Id = 3, name = "Abraham Lincoln" },
            new QuizNames { Id = 4, name = "Bob Ross" },
            new QuizNames { Id = 5, name = "Robin Williams" },
            new QuizNames { Id = 6, name = "Stan Lee" },
            new QuizNames { Id = 7, name = "Elvis Presley" },
            new QuizNames { Id = 8, name = "John Lennon" },
            new QuizNames { Id = 9, name = "Freddie Mercury" },
            new QuizNames { Id = 10, name = "Alan Rickman" },
            new QuizNames { Id = 11, name = "Marilyn Monroe" },
            new QuizNames { Id = 12, name = "Heath Ledger" },
            new QuizNames { Id = 13, name = "Steve Irwin" },
            new QuizNames { Id = 14, name = "Bruce Lee" },
            new QuizNames { Id = 15, name = "John Candy" },
            new QuizNames { Id = 16, name = "Carrie Fisher" },
            new QuizNames { Id = 17, name = "George Harrison" },
            new QuizNames { Id = 18, name = "Walt Disney" },
            new QuizNames { Id = 19, name = "Gene Wilder" },
            new QuizNames { Id = 20, name = "Anne Frank" },
            new QuizNames { Id = 21, name = "Mark Twain" },
            new QuizNames { Id = 22, name = "Paul Walker" },
            new QuizNames { Id = 23, name = "Johnny Cash" },
            new QuizNames { Id = 24, name = "David Bowie" },
            new QuizNames { Id = 25, name = "Nikola Tesla" },
            new QuizNames { Id = 26, name = "Audrey Hepburn" },
            new QuizNames { Id = 27, name = "Jimi Hendrix" },
            new QuizNames { Id = 28, name = "Michael Clarke" },
            new QuizNames { Id = 29, name = "Amadeus Mozart" },
            new QuizNames { Id = 30, name = "Mahatma Gandhi" }
             );
            

            modelBuilder.Entity<QuizQuestions>().HasData(
            new QuizQuestions { Id = 1, name = "Este filme pertence a que categoria(s)?", type = 1 },
            new QuizQuestions { Id = 2, name = "Atores que fizeram parte do elenco.", type = 1 },
            new QuizQuestions { Id = 3, name = "Em que ano saiu o filme?", type = 1 },
            new QuizQuestions { Id = 4, name = "Nome de personagens deste filme.", type = 1 },
            new QuizQuestions { Id = 5, name = "Realizador(es) deste filme.", type = 1 }
             );

        }
    }
}
 