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

                    b.Property<bool>("IsBanned")
                        .HasColumnType("bit");

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

            modelBuilder.Entity("WatchersWorld.Server.Models.Followers.Followers", b =>
                {
                    b.Property<Guid>("FollowersId")
                        .ValueGeneratedOnAdd()
                        .HasColumnType("uniqueidentifier");

                    b.Property<bool>("IsApproved")
                        .HasColumnType("bit");

                    b.Property<string>("WhosBeingFollowed")
                        .HasColumnType("nvarchar(max)");

                    b.Property<string>("WhosFollowing")
                        .HasColumnType("nvarchar(max)");

                    b.HasKey("FollowersId");

                    b.ToTable("Followers");
                });

            modelBuilder.Entity("WatchersWorld.Server.Models.Media.Comment", b =>
                {
                    b.Property<int>("Id")
                        .ValueGeneratedOnAdd()
                        .HasColumnType("int");

                    SqlServerPropertyBuilderExtensions.UseIdentityColumn(b.Property<int>("Id"));

                    b.Property<DateTime>("CreatedAt")
                        .HasColumnType("datetime2");

                    b.Property<int?>("IdTableMedia")
                        .HasColumnType("int");

                    b.Property<int>("MediaId")
                        .HasColumnType("int");

                    b.Property<int?>("ParentCommentId")
                        .HasColumnType("int");

                    b.Property<string>("Text")
                        .HasColumnType("nvarchar(max)");

                    b.Property<string>("UserId")
                        .HasColumnType("nvarchar(450)");

                    b.HasKey("Id");

                    b.HasIndex("IdTableMedia");

                    b.HasIndex("ParentCommentId");

                    b.HasIndex("UserId");

                    b.ToTable("Comments");
                });

            modelBuilder.Entity("WatchersWorld.Server.Models.Media.CommentDislike", b =>
                {
                    b.Property<int>("Id")
                        .ValueGeneratedOnAdd()
                        .HasColumnType("int");

                    SqlServerPropertyBuilderExtensions.UseIdentityColumn(b.Property<int>("Id"));

                    b.Property<int>("CommentId")
                        .HasColumnType("int");

                    b.Property<string>("UserId")
                        .HasColumnType("nvarchar(450)");

                    b.HasKey("Id");

                    b.HasIndex("CommentId");

                    b.HasIndex("UserId");

                    b.ToTable("CommentDislikes");
                });

            modelBuilder.Entity("WatchersWorld.Server.Models.Media.CommentLike", b =>
                {
                    b.Property<int>("Id")
                        .ValueGeneratedOnAdd()
                        .HasColumnType("int");

                    SqlServerPropertyBuilderExtensions.UseIdentityColumn(b.Property<int>("Id"));

                    b.Property<int>("CommentId")
                        .HasColumnType("int");

                    b.Property<string>("UserId")
                        .HasColumnType("nvarchar(450)");

                    b.HasKey("Id");

                    b.HasIndex("CommentId");

                    b.HasIndex("UserId");

                    b.ToTable("CommentLikes");
                });

            modelBuilder.Entity("WatchersWorld.Server.Models.Media.FavoriteActor.Actor", b =>
                {
                    b.Property<int>("ActorId")
                        .HasColumnType("int");

                    b.Property<string>("ActorName")
                        .IsRequired()
                        .HasColumnType("nvarchar(max)");

                    b.HasKey("ActorId");

                    b.ToTable("Actor");
                });

            modelBuilder.Entity("WatchersWorld.Server.Models.Media.FavoriteActor.ActorMedia", b =>
                {
                    b.Property<Guid>("Id")
                        .ValueGeneratedOnAdd()
                        .HasColumnType("uniqueidentifier");

                    b.Property<int>("ActorId")
                        .HasColumnType("int");

                    b.Property<int>("IdTableMedia")
                        .HasColumnType("int");

                    b.HasKey("Id");

                    b.HasIndex("ActorId");

                    b.HasIndex("IdTableMedia");

                    b.ToTable("ActorMedia");
                });

            modelBuilder.Entity("WatchersWorld.Server.Models.Media.FavoriteActor.FavoriteActorChoice", b =>
                {
                    b.Property<Guid>("Id")
                        .ValueGeneratedOnAdd()
                        .HasColumnType("uniqueidentifier");

                    b.Property<Guid>("ActorMediaId")
                        .HasColumnType("uniqueidentifier");

                    b.Property<string>("UserThatChooseId")
                        .IsRequired()
                        .HasColumnType("nvarchar(450)");

                    b.HasKey("Id");

                    b.HasIndex("ActorMediaId");

                    b.HasIndex("UserThatChooseId");

                    b.ToTable("FavoriteActorChoice");
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

                    b.HasIndex("IdMedia")
                        .IsUnique();

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

            modelBuilder.Entity("WatchersWorld.Server.Models.Media.Quiz.WatchersWorld.Server.Models.Media.Quiz.QuizAttempt", b =>
                {
                    b.Property<int>("Id")
                        .ValueGeneratedOnAdd()
                        .HasColumnType("int");

                    SqlServerPropertyBuilderExtensions.UseIdentityColumn(b.Property<int>("Id"));

                    b.Property<DateTime>("CompletedAt")
                        .HasColumnType("datetime2");

                    b.Property<int>("MediaId")
                        .HasColumnType("int");

                    b.Property<int>("Score")
                        .HasColumnType("int");

                    b.Property<string>("UserId")
                        .HasColumnType("nvarchar(max)");

                    b.HasKey("Id");

                    b.ToTable("QuizAttempts");
                });

            modelBuilder.Entity("WatchersWorld.Server.Models.Media.RatingMedia.UserRatingMedia", b =>
                {
                    b.Property<Guid>("Id")
                        .ValueGeneratedOnAdd()
                        .HasColumnType("uniqueidentifier");

                    b.Property<int>("IdTableMedia")
                        .HasColumnType("int");

                    b.Property<int>("Rating")
                        .HasColumnType("int");

                    b.Property<string>("UserThatRateId")
                        .IsRequired()
                        .HasColumnType("nvarchar(450)");

                    b.HasKey("Id");

                    b.HasIndex("IdTableMedia");

                    b.HasIndex("UserThatRateId");

                    b.ToTable("UserRatingMedia");
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

            modelBuilder.Entity("WatchersWorld.Server.Models.Notifications.Notification", b =>
                {
                    b.Property<Guid>("NotificationId")
                        .ValueGeneratedOnAdd()
                        .HasColumnType("uniqueidentifier");

                    b.Property<DateTime>("CreatedAt")
                        .HasColumnType("datetime2");

                    b.Property<string>("EventType")
                        .HasColumnType("nvarchar(max)");

                    b.Property<bool>("IsRead")
                        .HasColumnType("bit");

                    b.Property<string>("Message")
                        .HasColumnType("nvarchar(max)");

                    b.Property<string>("TriggeredByUserId")
                        .HasColumnType("nvarchar(max)");

                    b.HasKey("NotificationId");

                    b.ToTable("Notifications", (string)null);

                    b.UseTptMappingStrategy();
                });

            modelBuilder.Entity("WatchersWorld.Server.Models.Notifications.AchievementNotification", b =>
                {
                    b.HasBaseType("WatchersWorld.Server.Models.Notifications.Notification");

                    b.Property<string>("AchievementName")
                        .HasColumnType("nvarchar(max)");

                    b.ToTable("AchievementNotifications", (string)null);
                });

            modelBuilder.Entity("WatchersWorld.Server.Models.Notifications.FollowNotification", b =>
                {
                    b.HasBaseType("WatchersWorld.Server.Models.Notifications.Notification");

                    b.Property<string>("TargetUserId")
                        .HasColumnType("nvarchar(max)");

                    b.Property<string>("TriggeredByUserPhoto")
                        .HasColumnType("nvarchar(max)");

                    b.ToTable("FollowNotifications", (string)null);
                });

            modelBuilder.Entity("WatchersWorld.Server.Models.Notifications.ReplyNotification", b =>
                {
                    b.HasBaseType("WatchersWorld.Server.Models.Notifications.Notification");

                    b.Property<int>("CommentId")
                        .HasColumnType("int");

                    b.Property<int>("MediaId")
                        .HasColumnType("int");

                    b.Property<string>("TargetUserId")
                        .HasColumnType("nvarchar(max)");

                    b.Property<string>("TriggeredByUserPhoto")
                        .HasColumnType("nvarchar(max)");

                    b.ToTable("ReplyNotifications", (string)null);
                });

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

            modelBuilder.Entity("WatchersWorld.Server.Models.Media.Comment", b =>
                {
                    b.HasOne("WatchersWorld.Server.Models.Media.MediaInfoModel", "Media")
                        .WithMany("Comments")
                        .HasForeignKey("IdTableMedia");

                    b.HasOne("WatchersWorld.Server.Models.Media.Comment", "ParentComment")
                        .WithMany("Replies")
                        .HasForeignKey("ParentCommentId");

                    b.HasOne("WatchersWorld.Server.Models.Authentication.User", "User")
                        .WithMany()
                        .HasForeignKey("UserId");

                    b.Navigation("Media");

                    b.Navigation("ParentComment");

                    b.Navigation("User");
                });

            modelBuilder.Entity("WatchersWorld.Server.Models.Media.CommentDislike", b =>
                {
                    b.HasOne("WatchersWorld.Server.Models.Media.Comment", "Comment")
                        .WithMany("Dislikes")
                        .HasForeignKey("CommentId")
                        .OnDelete(DeleteBehavior.Cascade)
                        .IsRequired();

                    b.HasOne("WatchersWorld.Server.Models.Authentication.User", "User")
                        .WithMany()
                        .HasForeignKey("UserId");

                    b.Navigation("Comment");

                    b.Navigation("User");
                });

            modelBuilder.Entity("WatchersWorld.Server.Models.Media.CommentLike", b =>
                {
                    b.HasOne("WatchersWorld.Server.Models.Media.Comment", "Comment")
                        .WithMany("Likes")
                        .HasForeignKey("CommentId")
                        .OnDelete(DeleteBehavior.Cascade)
                        .IsRequired();

                    b.HasOne("WatchersWorld.Server.Models.Authentication.User", "User")
                        .WithMany()
                        .HasForeignKey("UserId");

                    b.Navigation("Comment");

                    b.Navigation("User");
                });

            modelBuilder.Entity("WatchersWorld.Server.Models.Media.FavoriteActor.ActorMedia", b =>
                {
                    b.HasOne("WatchersWorld.Server.Models.Media.FavoriteActor.Actor", "Actor")
                        .WithMany()
                        .HasForeignKey("ActorId")
                        .OnDelete(DeleteBehavior.Cascade)
                        .IsRequired();

                    b.HasOne("WatchersWorld.Server.Models.Media.MediaInfoModel", "MediaInfo")
                        .WithMany()
                        .HasForeignKey("IdTableMedia")
                        .OnDelete(DeleteBehavior.Cascade)
                        .IsRequired();

                    b.Navigation("Actor");

                    b.Navigation("MediaInfo");
                });

            modelBuilder.Entity("WatchersWorld.Server.Models.Media.FavoriteActor.FavoriteActorChoice", b =>
                {
                    b.HasOne("WatchersWorld.Server.Models.Media.FavoriteActor.ActorMedia", "ActorMedia")
                        .WithMany()
                        .HasForeignKey("ActorMediaId")
                        .OnDelete(DeleteBehavior.Cascade)
                        .IsRequired();

                    b.HasOne("WatchersWorld.Server.Models.Authentication.User", "User")
                        .WithMany()
                        .HasForeignKey("UserThatChooseId")
                        .OnDelete(DeleteBehavior.Cascade)
                        .IsRequired();

                    b.Navigation("ActorMedia");

                    b.Navigation("User");
                });

            modelBuilder.Entity("WatchersWorld.Server.Models.Media.RatingMedia.UserRatingMedia", b =>
                {
                    b.HasOne("WatchersWorld.Server.Models.Media.MediaInfoModel", "MediaInfo")
                        .WithMany()
                        .HasForeignKey("IdTableMedia")
                        .OnDelete(DeleteBehavior.Cascade)
                        .IsRequired();

                    b.HasOne("WatchersWorld.Server.Models.Authentication.User", "User")
                        .WithMany()
                        .HasForeignKey("UserThatRateId")
                        .OnDelete(DeleteBehavior.Cascade)
                        .IsRequired();

                    b.Navigation("MediaInfo");

                    b.Navigation("User");
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

            modelBuilder.Entity("WatchersWorld.Server.Models.Notifications.AchievementNotification", b =>
                {
                    b.HasOne("WatchersWorld.Server.Models.Notifications.Notification", null)
                        .WithOne()
                        .HasForeignKey("WatchersWorld.Server.Models.Notifications.AchievementNotification", "NotificationId")
                        .OnDelete(DeleteBehavior.Cascade)
                        .IsRequired();
                });

            modelBuilder.Entity("WatchersWorld.Server.Models.Notifications.FollowNotification", b =>
                {
                    b.HasOne("WatchersWorld.Server.Models.Notifications.Notification", null)
                        .WithOne()
                        .HasForeignKey("WatchersWorld.Server.Models.Notifications.FollowNotification", "NotificationId")
                        .OnDelete(DeleteBehavior.Cascade)
                        .IsRequired();
                });

            modelBuilder.Entity("WatchersWorld.Server.Models.Notifications.ReplyNotification", b =>
                {
                    b.HasOne("WatchersWorld.Server.Models.Notifications.Notification", null)
                        .WithOne()
                        .HasForeignKey("WatchersWorld.Server.Models.Notifications.ReplyNotification", "NotificationId")
                        .OnDelete(DeleteBehavior.Cascade)
                        .IsRequired();
                });

            modelBuilder.Entity("WatchersWorld.Server.Models.Media.Comment", b =>
                {
                    b.Navigation("Dislikes");

                    b.Navigation("Likes");

                    b.Navigation("Replies");
                });

            modelBuilder.Entity("WatchersWorld.Server.Models.Media.MediaInfoModel", b =>
                {
                    b.Navigation("Comments");
                });
#pragma warning restore 612, 618
        }
    }
}
