﻿// <auto-generated />
using System;
using Microsoft.EntityFrameworkCore;
using Microsoft.EntityFrameworkCore.Infrastructure;
using Microsoft.EntityFrameworkCore.Metadata;
using Microsoft.EntityFrameworkCore.Storage.ValueConversion;
using WatchersWorld.Server.Data;

#nullable disable

namespace WatchersWorld.Server.Migrations
{
    [DbContext(typeof(WatchersWorldServerContext))]
    partial class WatchersWorldServerContextModelSnapshot : ModelSnapshot
    {
        protected override void BuildModel(ModelBuilder modelBuilder)
        {
#pragma warning disable 612, 618
            modelBuilder
                .HasAnnotation("ProductVersion", "8.0.1")
                .HasAnnotation("Relational:MaxIdentifierLength", 128);

            SqlServerModelBuilderExtensions.UseIdentityColumns(modelBuilder);

            modelBuilder.Entity("Microsoft.AspNetCore.Identity.IdentityRole", b =>
                {
                    b.Property<string>("Id")
                        .HasColumnType("nvarchar(450)");

                    b.Property<string>("ConcurrencyStamp")
                        .IsConcurrencyToken()
                        .HasColumnType("nvarchar(max)");

                    b.Property<string>("Name")
                        .HasMaxLength(256)
                        .HasColumnType("nvarchar(256)");

                    b.Property<string>("NormalizedName")
                        .HasMaxLength(256)
                        .HasColumnType("nvarchar(256)");

                    b.HasKey("Id");

                    b.HasIndex("NormalizedName")
                        .IsUnique()
                        .HasDatabaseName("RoleNameIndex")
                        .HasFilter("[NormalizedName] IS NOT NULL");

                    b.ToTable("AspNetRoles", (string)null);
                });

            modelBuilder.Entity("Microsoft.AspNetCore.Identity.IdentityRoleClaim<string>", b =>
                {
                    b.Property<int>("Id")
                        .ValueGeneratedOnAdd()
                        .HasColumnType("int");

                    SqlServerPropertyBuilderExtensions.UseIdentityColumn(b.Property<int>("Id"));

                    b.Property<string>("ClaimType")
                        .HasColumnType("nvarchar(max)");

                    b.Property<string>("ClaimValue")
                        .HasColumnType("nvarchar(max)");

                    b.Property<string>("RoleId")
                        .IsRequired()
                        .HasColumnType("nvarchar(450)");

                    b.HasKey("Id");

                    b.HasIndex("RoleId");

                    b.ToTable("AspNetRoleClaims", (string)null);
                });

            modelBuilder.Entity("Microsoft.AspNetCore.Identity.IdentityUserClaim<string>", b =>
                {
                    b.Property<int>("Id")
                        .ValueGeneratedOnAdd()
                        .HasColumnType("int");

                    SqlServerPropertyBuilderExtensions.UseIdentityColumn(b.Property<int>("Id"));

                    b.Property<string>("ClaimType")
                        .HasColumnType("nvarchar(max)");

                    b.Property<string>("ClaimValue")
                        .HasColumnType("nvarchar(max)");

                    b.Property<string>("UserId")
                        .IsRequired()
                        .HasColumnType("nvarchar(450)");

                    b.HasKey("Id");

                    b.HasIndex("UserId");

                    b.ToTable("AspNetUserClaims", (string)null);
                });

            modelBuilder.Entity("Microsoft.AspNetCore.Identity.IdentityUserLogin<string>", b =>
                {
                    b.Property<string>("LoginProvider")
                        .HasColumnType("nvarchar(450)");

                    b.Property<string>("ProviderKey")
                        .HasColumnType("nvarchar(450)");

                    b.Property<string>("ProviderDisplayName")
                        .HasColumnType("nvarchar(max)");

                    b.Property<string>("UserId")
                        .IsRequired()
                        .HasColumnType("nvarchar(450)");

                    b.HasKey("LoginProvider", "ProviderKey");

                    b.HasIndex("UserId");

                    b.ToTable("AspNetUserLogins", (string)null);
                });

            modelBuilder.Entity("Microsoft.AspNetCore.Identity.IdentityUserRole<string>", b =>
                {
                    b.Property<string>("UserId")
                        .HasColumnType("nvarchar(450)");

                    b.Property<string>("RoleId")
                        .HasColumnType("nvarchar(450)");

                    b.HasKey("UserId", "RoleId");

                    b.HasIndex("RoleId");

                    b.ToTable("AspNetUserRoles", (string)null);
                });

            modelBuilder.Entity("Microsoft.AspNetCore.Identity.IdentityUserToken<string>", b =>
                {
                    b.Property<string>("UserId")
                        .HasColumnType("nvarchar(450)");

                    b.Property<string>("LoginProvider")
                        .HasColumnType("nvarchar(450)");

                    b.Property<string>("Name")
                        .HasColumnType("nvarchar(450)");

                    b.Property<string>("Value")
                        .HasColumnType("nvarchar(max)");

                    b.HasKey("UserId", "LoginProvider", "Name");

                    b.ToTable("AspNetUserTokens", (string)null);
                });

            modelBuilder.Entity("WatchersWorld.Server.Models.Authentication.ProfileInfo", b =>
                {
                    b.Property<string>("UserName")
                        .HasColumnType("nvarchar(450)");

                    b.Property<DateTime>("BirthDate")
                        .HasColumnType("datetime2");

                    b.Property<string>("CoverPhoto")
                        .HasColumnType("nvarchar(max)");

                    b.Property<string>("Description")
                        .HasColumnType("nvarchar(max)");

                    b.Property<DateTime?>("EndBanDate")
                        .HasColumnType("datetime2");

                    b.Property<int>("Followers")
                        .HasColumnType("int");

                    b.Property<int>("Following")
                        .HasColumnType("int");

                    b.Property<string>("Gender")
                        .IsRequired()
                        .HasColumnType("nvarchar(1)");

                    b.Property<string>("ProfilePhoto")
                        .HasColumnType("nvarchar(max)");

                    b.Property<string>("ProfileStatus")
                        .HasColumnType("nvarchar(max)");

                    b.Property<DateTime?>("StartBanDate")
                        .HasColumnType("datetime2");

                    b.Property<string>("UserId")
                        .HasColumnType("nvarchar(max)");

                    b.HasKey("UserName");

                    b.ToTable("ProfileInfo");
                });

            modelBuilder.Entity("WatchersWorld.Server.Models.Authentication.User", b =>
                {
                    b.Property<string>("Id")
                        .HasColumnType("nvarchar(450)");

                    b.Property<int>("AccessFailedCount")
                        .HasColumnType("int");

                    b.Property<string>("ConcurrencyStamp")
                        .IsConcurrencyToken()
                        .HasColumnType("nvarchar(max)");

                    b.Property<string>("Email")
                        .HasMaxLength(256)
                        .HasColumnType("nvarchar(256)");

                    b.Property<bool>("EmailConfirmed")
                        .HasColumnType("bit");

                    b.Property<bool>("LockoutEnabled")
                        .HasColumnType("bit");

                    b.Property<DateTimeOffset?>("LockoutEnd")
                        .HasColumnType("datetimeoffset");

                    b.Property<string>("NormalizedEmail")
                        .HasMaxLength(256)
                        .HasColumnType("nvarchar(256)");

                    b.Property<string>("NormalizedUserName")
                        .HasMaxLength(256)
                        .HasColumnType("nvarchar(256)");

                    b.Property<string>("PasswordHash")
                        .HasColumnType("nvarchar(max)");

                    b.Property<string>("PhoneNumber")
                        .HasColumnType("nvarchar(max)");

                    b.Property<bool>("PhoneNumberConfirmed")
                        .HasColumnType("bit");

                    b.Property<string>("Provider")
                        .IsRequired()
                        .HasColumnType("nvarchar(max)");

                    b.Property<string>("SecurityStamp")
                        .HasColumnType("nvarchar(max)");

                    b.Property<bool>("TwoFactorEnabled")
                        .HasColumnType("bit");

                    b.Property<string>("UserName")
                        .HasMaxLength(256)
                        .HasColumnType("nvarchar(256)");

                    b.HasKey("Id");

                    b.HasIndex("NormalizedEmail")
                        .HasDatabaseName("EmailIndex");

                    b.HasIndex("NormalizedUserName")
                        .IsUnique()
                        .HasDatabaseName("UserNameIndex")
                        .HasFilter("[NormalizedUserName] IS NOT NULL");

                    b.ToTable("AspNetUsers", (string)null);
                });

            modelBuilder.Entity("WatchersWorld.Server.Models.Followers", b =>
                {
                    b.Property<Guid>("FollowersId")
                        .ValueGeneratedOnAdd()
                        .HasColumnType("uniqueidentifier");

                    b.Property<string>("WhosBeingFollowed")
                        .HasColumnType("nvarchar(max)");

                    b.Property<string>("WhosFollowing")
                        .HasColumnType("nvarchar(max)");

                    b.HasKey("FollowersId");

                    b.ToTable("Followers");
                });

            modelBuilder.Entity("WatchersWorld.Server.Models.Media.MediaInfoModel", b =>
                {
                    b.Property<int>("IdTableMedia")
                        .ValueGeneratedOnAdd()
                        .HasColumnType("int");

                    SqlServerPropertyBuilderExtensions.UseIdentityColumn(b.Property<int>("IdTableMedia"));

                    b.Property<int>("IdMedia")
                        .HasColumnType("int");

                    b.Property<string>("Type")
                        .HasColumnType("nvarchar(max)");

                    b.HasKey("IdTableMedia");

                    b.ToTable("MediaInfoModel");
                });

            modelBuilder.Entity("WatchersWorld.Server.Models.Media.MediaListModel", b =>
                {
                    b.Property<int>("Id")
                        .ValueGeneratedOnAdd()
                        .HasColumnType("int");

                    SqlServerPropertyBuilderExtensions.UseIdentityColumn(b.Property<int>("Id"));

                    b.Property<string>("ListName")
                        .HasColumnType("nvarchar(max)");

                    b.HasKey("Id");

                    b.ToTable("MediaListModel");

                    b.HasData(
                        new
                        {
                            Id = 1,
                            ListName = "Filmes"
                        },
                        new
                        {
                            Id = 2,
                            ListName = "Séries"
                        },
                        new
                        {
                            Id = 3,
                            ListName = "Ver Mais Tarde Series"
                        },
                        new
                        {
                            Id = 4,
                            ListName = "Ver Mais Tarde Filmes"
                        },
                        new
                        {
                            Id = 5,
                            ListName = "Favoritos"
                        });
                });

            modelBuilder.Entity("WatchersWorld.Server.Models.Media.UserMedia", b =>
                {
                    b.Property<int>("Id")
                        .ValueGeneratedOnAdd()
                        .HasColumnType("int");

                    SqlServerPropertyBuilderExtensions.UseIdentityColumn(b.Property<int>("Id"));

                    b.Property<int?>("IdListMedia")
                        .HasColumnType("int");

                    b.Property<int>("IdTableMedia")
                        .HasColumnType("int");

                    b.Property<string>("UserId")
                        .HasColumnType("nvarchar(max)");

                    b.HasKey("Id");

                    b.HasIndex("IdListMedia");

                    b.HasIndex("IdTableMedia");

                    b.ToTable("UserMedia");
                });

<<<<<<< HEAD
            modelBuilder.Entity("WatchersWorld.Server.Models.Quiz.QuizCategorys", b =>
                {
                    b.Property<int>("Id")
                        .ValueGeneratedOnAdd()
                        .HasColumnType("int");

                    SqlServerPropertyBuilderExtensions.UseIdentityColumn(b.Property<int>("Id"));

                    b.Property<string>("name")
                        .HasColumnType("nvarchar(max)");

                    b.HasKey("Id");

                    b.ToTable("QuizCategorys");

                    b.HasData(
                        new
                        {
                            Id = 1,
                            name = "Horror"
                        },
                        new
                        {
                            Id = 2,
                            name = "Terror"
                        },
                        new
                        {
                            Id = 3,
                            name = "Comedy"
                        },
                        new
                        {
                            Id = 4,
                            name = "Adventure"
                        },
                        new
                        {
                            Id = 5,
                            name = "Animation"
                        },
                        new
                        {
                            Id = 6,
                            name = "Drama"
                        },
                        new
                        {
                            Id = 7,
                            name = "Thriller"
                        },
                        new
                        {
                            Id = 8,
                            name = "Crime"
                        },
                        new
                        {
                            Id = 9,
                            name = "Television"
                        },
                        new
                        {
                            Id = 10,
                            name = "Western"
                        },
                        new
                        {
                            Id = 11,
                            name = "Romance"
                        },
                        new
                        {
                            Id = 12,
                            name = "Science fiction"
                        },
                        new
                        {
                            Id = 13,
                            name = "Fantasy"
                        },
                        new
                        {
                            Id = 14,
                            name = "Historical"
                        },
                        new
                        {
                            Id = 15,
                            name = "Documentary"
                        },
                        new
                        {
                            Id = 16,
                            name = "Musical"
                        },
                        new
                        {
                            Id = 17,
                            name = "Science"
                        },
                        new
                        {
                            Id = 18,
                            name = "War"
                        },
                        new
                        {
                            Id = 19,
                            name = "Cyberpunk"
                        },
                        new
                        {
                            Id = 20,
                            name = "Short"
                        });
                });

            modelBuilder.Entity("WatchersWorld.Server.Models.Quiz.QuizMedia", b =>
                {
                    b.Property<int>("Id")
                        .ValueGeneratedOnAdd()
                        .HasColumnType("int");

                    SqlServerPropertyBuilderExtensions.UseIdentityColumn(b.Property<int>("Id"));

                    b.Property<string>("actor")
                        .HasColumnType("nvarchar(max)");

                    b.Property<string>("category")
                        .HasColumnType("nvarchar(max)");

                    b.Property<string>("person")
                        .HasColumnType("nvarchar(max)");

                    b.Property<string>("real")
                        .HasColumnType("nvarchar(max)");

                    b.Property<string>("year")
                        .HasColumnType("nvarchar(max)");

                    b.HasKey("Id");

                    b.ToTable("QuizMedia");
                });

            modelBuilder.Entity("WatchersWorld.Server.Models.Quiz.QuizNames", b =>
                {
                    b.Property<int>("Id")
                        .ValueGeneratedOnAdd()
                        .HasColumnType("int");

                    SqlServerPropertyBuilderExtensions.UseIdentityColumn(b.Property<int>("Id"));

                    b.Property<string>("name")
                        .HasColumnType("nvarchar(max)");

                    b.HasKey("Id");

                    b.ToTable("QuizNames");

                    b.HasData(
                        new
                        {
                            Id = 1,
                            name = "Martin Luther"
                        },
                        new
                        {
                            Id = 2,
                            name = "Albert Einstein"
                        },
                        new
                        {
                            Id = 3,
                            name = "Abraham Lincoln"
                        },
                        new
                        {
                            Id = 4,
                            name = "Bob Ross"
                        },
                        new
                        {
                            Id = 5,
                            name = "Robin Williams"
                        },
                        new
                        {
                            Id = 6,
                            name = "Stan Lee"
                        },
                        new
                        {
                            Id = 7,
                            name = "Elvis Presley"
                        },
                        new
                        {
                            Id = 8,
                            name = "John Lennon"
                        },
                        new
                        {
                            Id = 9,
                            name = "Freddie Mercury"
                        },
                        new
                        {
                            Id = 10,
                            name = "Alan Rickman"
                        },
                        new
                        {
                            Id = 11,
                            name = "Marilyn Monroe"
                        },
                        new
                        {
                            Id = 12,
                            name = "Heath Ledger"
                        },
                        new
                        {
                            Id = 13,
                            name = "Steve Irwin"
                        },
                        new
                        {
                            Id = 14,
                            name = "Bruce Lee"
                        },
                        new
                        {
                            Id = 15,
                            name = "John Candy"
                        },
                        new
                        {
                            Id = 16,
                            name = "Carrie Fisher"
                        },
                        new
                        {
                            Id = 17,
                            name = "George Harrison"
                        },
                        new
                        {
                            Id = 18,
                            name = "Walt Disney"
                        },
                        new
                        {
                            Id = 19,
                            name = "Gene Wilder"
                        },
                        new
                        {
                            Id = 20,
                            name = "Anne Frank"
                        },
                        new
                        {
                            Id = 21,
                            name = "Mark Twain"
                        },
                        new
                        {
                            Id = 22,
                            name = "Paul Walker"
                        },
                        new
                        {
                            Id = 23,
                            name = "Johnny Cash"
                        },
                        new
                        {
                            Id = 24,
                            name = "David Bowie"
                        },
                        new
                        {
                            Id = 25,
                            name = "Nikola Tesla"
                        },
                        new
                        {
                            Id = 26,
                            name = "Audrey Hepburn"
                        },
                        new
                        {
                            Id = 27,
                            name = "Jimi Hendrix"
                        },
                        new
                        {
                            Id = 28,
                            name = "Michael Clarke"
                        },
                        new
                        {
                            Id = 29,
                            name = "Amadeus Mozart"
                        },
                        new
                        {
                            Id = 30,
                            name = "Mahatma Gandhi"
                        });
                });

            modelBuilder.Entity("WatchersWorld.Server.Models.Quiz.QuizOption", b =>
                {
                    b.Property<int>("Id")
                        .ValueGeneratedOnAdd()
                        .HasColumnType("int");

                    SqlServerPropertyBuilderExtensions.UseIdentityColumn(b.Property<int>("Id"));

                    b.Property<int>("IdQuizQuestion")
                        .HasColumnType("int");

                    b.Property<int?>("IdQuizQuestions")
                        .HasColumnType("int");

                    b.Property<bool>("answer")
                        .HasColumnType("bit");

                    b.Property<string>("name")
                        .HasColumnType("nvarchar(max)");

                    b.Property<bool>("selected")
                        .HasColumnType("bit");

                    b.HasKey("Id");

                    b.HasIndex("IdQuizQuestions");

                    b.ToTable("QuizOption");
                });

            modelBuilder.Entity("WatchersWorld.Server.Models.Quiz.QuizQuestion", b =>
                {
                    b.Property<int>("Id")
                        .ValueGeneratedOnAdd()
                        .HasColumnType("int");

                    SqlServerPropertyBuilderExtensions.UseIdentityColumn(b.Property<int>("Id"));

                    b.Property<int>("IdQuizQuestions")
                        .HasColumnType("int");

                    b.Property<int>("IdQuizQuestionsGroup")
                        .HasColumnType("int");

                    b.HasKey("Id");

                    b.HasIndex("IdQuizQuestions");

                    b.HasIndex("IdQuizQuestionsGroup");

                    b.ToTable("QuizQuestion");
                });

            modelBuilder.Entity("WatchersWorld.Server.Models.Quiz.QuizQuestions", b =>
                {
                    b.Property<int>("Id")
                        .ValueGeneratedOnAdd()
                        .HasColumnType("int");

                    SqlServerPropertyBuilderExtensions.UseIdentityColumn(b.Property<int>("Id"));

                    b.Property<string>("name")
                        .HasColumnType("nvarchar(max)");

                    b.Property<int>("type")
                        .HasColumnType("int");

                    b.HasKey("Id");

                    b.ToTable("QuizQuestions");

                    b.HasData(
                        new
                        {
                            Id = 1,
                            name = "Este filme pertence a que categoria(s)?",
                            type = 0
                        },
                        new
                        {
                            Id = 2,
                            name = "Atores que fizeram parte do elenco.",
                            type = 1
                        },
                        new
                        {
                            Id = 3,
                            name = "Em que ano saiu o filme?",
                            type = 2
                        },
                        new
                        {
                            Id = 4,
                            name = "Nome de personagens deste filme.",
                            type = 3
                        },
                        new
                        {
                            Id = 5,
                            name = "Realizador(es) deste filme.",
                            type = 4
                        });
                });

            modelBuilder.Entity("WatchersWorld.Server.Models.Quiz.QuizQuestionsGroup", b =>
                {
                    b.Property<int>("Id")
                        .ValueGeneratedOnAdd()
                        .HasColumnType("int");

                    SqlServerPropertyBuilderExtensions.UseIdentityColumn(b.Property<int>("Id"));

                    b.Property<bool>("Done")
                        .HasColumnType("bit");

                    b.Property<int>("MediaId")
                        .HasColumnType("int");

                    b.Property<string>("UserId")
                        .HasColumnType("nvarchar(max)");

                    b.HasKey("Id");

                    b.ToTable("QuizQuestionsGroup");
                });

            modelBuilder.Entity("WatchersWorld.Server.Models.Quiz.QuizYears", b =>
                {
                    b.Property<int>("Id")
                        .ValueGeneratedOnAdd()
                        .HasColumnType("int");

                    SqlServerPropertyBuilderExtensions.UseIdentityColumn(b.Property<int>("Id"));

                    b.Property<string>("name")
                        .HasColumnType("nvarchar(max)");

                    b.HasKey("Id");

                    b.ToTable("QuizYears");

                    b.HasData(
                        new
                        {
                            Id = 1,
                            name = "2010"
                        },
                        new
                        {
                            Id = 2,
                            name = "2100"
                        },
                        new
                        {
                            Id = 3,
                            name = "1600"
                        },
                        new
                        {
                            Id = 4,
                            name = "3010"
                        },
                        new
                        {
                            Id = 5,
                            name = "2102"
                        });
                });

=======
>>>>>>> development
            modelBuilder.Entity("Microsoft.AspNetCore.Identity.IdentityRoleClaim<string>", b =>
                {
                    b.HasOne("Microsoft.AspNetCore.Identity.IdentityRole", null)
                        .WithMany()
                        .HasForeignKey("RoleId")
                        .OnDelete(DeleteBehavior.Cascade)
                        .IsRequired();
                });

            modelBuilder.Entity("Microsoft.AspNetCore.Identity.IdentityUserClaim<string>", b =>
                {
                    b.HasOne("WatchersWorld.Server.Models.Authentication.User", null)
                        .WithMany()
                        .HasForeignKey("UserId")
                        .OnDelete(DeleteBehavior.Cascade)
                        .IsRequired();
                });

            modelBuilder.Entity("Microsoft.AspNetCore.Identity.IdentityUserLogin<string>", b =>
                {
                    b.HasOne("WatchersWorld.Server.Models.Authentication.User", null)
                        .WithMany()
                        .HasForeignKey("UserId")
                        .OnDelete(DeleteBehavior.Cascade)
                        .IsRequired();
                });

            modelBuilder.Entity("Microsoft.AspNetCore.Identity.IdentityUserRole<string>", b =>
                {
                    b.HasOne("Microsoft.AspNetCore.Identity.IdentityRole", null)
                        .WithMany()
                        .HasForeignKey("RoleId")
                        .OnDelete(DeleteBehavior.Cascade)
                        .IsRequired();

                    b.HasOne("WatchersWorld.Server.Models.Authentication.User", null)
                        .WithMany()
                        .HasForeignKey("UserId")
                        .OnDelete(DeleteBehavior.Cascade)
                        .IsRequired();
                });

            modelBuilder.Entity("Microsoft.AspNetCore.Identity.IdentityUserToken<string>", b =>
                {
                    b.HasOne("WatchersWorld.Server.Models.Authentication.User", null)
                        .WithMany()
                        .HasForeignKey("UserId")
                        .OnDelete(DeleteBehavior.Cascade)
                        .IsRequired();
                });

            modelBuilder.Entity("WatchersWorld.Server.Models.Media.UserMedia", b =>
                {
                    b.HasOne("WatchersWorld.Server.Models.Media.MediaListModel", "MediaListModel")
                        .WithMany()
                        .HasForeignKey("IdListMedia");

                    b.HasOne("WatchersWorld.Server.Models.Media.MediaInfoModel", "MediaInfoModel")
                        .WithMany()
                        .HasForeignKey("IdTableMedia")
                        .OnDelete(DeleteBehavior.Cascade)
                        .IsRequired();

                    b.Navigation("MediaInfoModel");

                    b.Navigation("MediaListModel");
                });
<<<<<<< HEAD

            modelBuilder.Entity("WatchersWorld.Server.Models.Quiz.QuizOption", b =>
                {
                    b.HasOne("WatchersWorld.Server.Models.Quiz.QuizQuestion", "QuizQuestion")
                        .WithMany()
                        .HasForeignKey("IdQuizQuestions");

                    b.Navigation("QuizQuestion");
                });

            modelBuilder.Entity("WatchersWorld.Server.Models.Quiz.QuizQuestion", b =>
                {
                    b.HasOne("WatchersWorld.Server.Models.Quiz.QuizQuestions", "QuizQuestions")
                        .WithMany()
                        .HasForeignKey("IdQuizQuestions")
                        .OnDelete(DeleteBehavior.Cascade)
                        .IsRequired();

                    b.HasOne("WatchersWorld.Server.Models.Quiz.QuizQuestionsGroup", "QuizQuestionsGroup")
                        .WithMany()
                        .HasForeignKey("IdQuizQuestionsGroup")
                        .OnDelete(DeleteBehavior.Cascade)
                        .IsRequired();

                    b.Navigation("QuizQuestions");

                    b.Navigation("QuizQuestionsGroup");
                });
=======
>>>>>>> development
#pragma warning restore 612, 618
        }
    }
}
