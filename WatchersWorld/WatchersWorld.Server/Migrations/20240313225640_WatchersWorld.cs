using System;
using Microsoft.EntityFrameworkCore.Migrations;

#nullable disable

#pragma warning disable CA1814 // Prefer jagged arrays over multidimensional

namespace WatchersWorld.Server.Migrations
{
    /// <inheritdoc />
    public partial class watchersworld : Migration
    {
        /// <inheritdoc />
        protected override void Up(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.CreateTable(
                name: "AspNetRoles",
                columns: table => new
                {
                    Id = table.Column<string>(type: "nvarchar(450)", nullable: false),
                    Name = table.Column<string>(type: "nvarchar(256)", maxLength: 256, nullable: true),
                    NormalizedName = table.Column<string>(type: "nvarchar(256)", maxLength: 256, nullable: true),
                    ConcurrencyStamp = table.Column<string>(type: "nvarchar(max)", nullable: true)
                },
                constraints: table =>
                {
                    table.PrimaryKey("PK_AspNetRoles", x => x.Id);
                });

            migrationBuilder.CreateTable(
                name: "AspNetUsers",
                columns: table => new
                {
                    Id = table.Column<string>(type: "nvarchar(450)", nullable: false),
                    Provider = table.Column<string>(type: "nvarchar(max)", nullable: false),
                    UserName = table.Column<string>(type: "nvarchar(256)", maxLength: 256, nullable: true),
                    NormalizedUserName = table.Column<string>(type: "nvarchar(256)", maxLength: 256, nullable: true),
                    Email = table.Column<string>(type: "nvarchar(256)", maxLength: 256, nullable: true),
                    NormalizedEmail = table.Column<string>(type: "nvarchar(256)", maxLength: 256, nullable: true),
                    EmailConfirmed = table.Column<bool>(type: "bit", nullable: false),
                    PasswordHash = table.Column<string>(type: "nvarchar(max)", nullable: true),
                    SecurityStamp = table.Column<string>(type: "nvarchar(max)", nullable: true),
                    ConcurrencyStamp = table.Column<string>(type: "nvarchar(max)", nullable: true),
                    PhoneNumber = table.Column<string>(type: "nvarchar(max)", nullable: true),
                    PhoneNumberConfirmed = table.Column<bool>(type: "bit", nullable: false),
                    TwoFactorEnabled = table.Column<bool>(type: "bit", nullable: false),
                    LockoutEnd = table.Column<DateTimeOffset>(type: "datetimeoffset", nullable: true),
                    LockoutEnabled = table.Column<bool>(type: "bit", nullable: false),
                    AccessFailedCount = table.Column<int>(type: "int", nullable: false)
                },
                constraints: table =>
                {
                    table.PrimaryKey("PK_AspNetUsers", x => x.Id);
                });

            migrationBuilder.CreateTable(
                name: "Followers",
                columns: table => new
                {
                    FollowersId = table.Column<Guid>(type: "uniqueidentifier", nullable: false),
                    WhosFollowing = table.Column<string>(type: "nvarchar(max)", nullable: true),
                    WhosBeingFollowed = table.Column<string>(type: "nvarchar(max)", nullable: true)
                },
                constraints: table =>
                {
                    table.PrimaryKey("PK_Followers", x => x.FollowersId);
                });

            migrationBuilder.CreateTable(
                name: "MediaInfoModel",
                columns: table => new
                {
                    IdTableMedia = table.Column<int>(type: "int", nullable: false)
                        .Annotation("SqlServer:Identity", "1, 1"),
                    IdMedia = table.Column<int>(type: "int", nullable: false),
                    Type = table.Column<string>(type: "nvarchar(max)", nullable: true)
                },
                constraints: table =>
                {
                    table.PrimaryKey("PK_MediaInfoModel", x => x.IdTableMedia);
                });

            migrationBuilder.CreateTable(
                name: "MediaListModel",
                columns: table => new
                {
                    Id = table.Column<int>(type: "int", nullable: false)
                        .Annotation("SqlServer:Identity", "1, 1"),
                    ListName = table.Column<string>(type: "nvarchar(max)", nullable: true)
                },
                constraints: table =>
                {
                    table.PrimaryKey("PK_MediaListModel", x => x.Id);
                });

            migrationBuilder.CreateTable(
                name: "ProfileInfo",
                columns: table => new
                {
                    UserName = table.Column<string>(type: "nvarchar(450)", nullable: false),
                    UserId = table.Column<string>(type: "nvarchar(max)", nullable: true),
                    BirthDate = table.Column<DateTime>(type: "datetime2", nullable: false),
                    Description = table.Column<string>(type: "nvarchar(max)", nullable: true),
                    Gender = table.Column<string>(type: "nvarchar(1)", nullable: false),
                    ProfilePhoto = table.Column<string>(type: "nvarchar(max)", nullable: true),
                    CoverPhoto = table.Column<string>(type: "nvarchar(max)", nullable: true),
                    ProfileStatus = table.Column<string>(type: "nvarchar(max)", nullable: true),
                    Followers = table.Column<int>(type: "int", nullable: false),
                    Following = table.Column<int>(type: "int", nullable: false),
                    StartBanDate = table.Column<DateTime>(type: "datetime2", nullable: true),
                    EndBanDate = table.Column<DateTime>(type: "datetime2", nullable: true)
                },
                constraints: table =>
                {
                    table.PrimaryKey("PK_ProfileInfo", x => x.UserName);
                });

            migrationBuilder.CreateTable(
                name: "QuizCategorys",
                columns: table => new
                {
                    Id = table.Column<int>(type: "int", nullable: false)
                        .Annotation("SqlServer:Identity", "1, 1"),
                    name = table.Column<string>(type: "nvarchar(max)", nullable: true)
                },
                constraints: table =>
                {
                    table.PrimaryKey("PK_QuizCategorys", x => x.Id);
                });

            migrationBuilder.CreateTable(
                name: "QuizMedia",
                columns: table => new
                {
                    Id = table.Column<int>(type: "int", nullable: false)
                        .Annotation("SqlServer:Identity", "1, 1"),
                    actor = table.Column<string>(type: "nvarchar(max)", nullable: true),
                    year = table.Column<string>(type: "nvarchar(max)", nullable: true),
                    person = table.Column<string>(type: "nvarchar(max)", nullable: true),
                    category = table.Column<string>(type: "nvarchar(max)", nullable: true),
                    real = table.Column<string>(type: "nvarchar(max)", nullable: true)
                },
                constraints: table =>
                {
                    table.PrimaryKey("PK_QuizMedia", x => x.Id);
                });

            migrationBuilder.CreateTable(
                name: "QuizNames",
                columns: table => new
                {
                    Id = table.Column<int>(type: "int", nullable: false)
                        .Annotation("SqlServer:Identity", "1, 1"),
                    name = table.Column<string>(type: "nvarchar(max)", nullable: true)
                },
                constraints: table =>
                {
                    table.PrimaryKey("PK_QuizNames", x => x.Id);
                });

            migrationBuilder.CreateTable(
                name: "QuizQuestions",
                columns: table => new
                {
                    Id = table.Column<int>(type: "int", nullable: false)
                        .Annotation("SqlServer:Identity", "1, 1"),
                    name = table.Column<string>(type: "nvarchar(max)", nullable: true),
                    type = table.Column<int>(type: "int", nullable: false)
                },
                constraints: table =>
                {
                    table.PrimaryKey("PK_QuizQuestions", x => x.Id);
                });

            migrationBuilder.CreateTable(
                name: "QuizQuestionsGroup",
                columns: table => new
                {
                    Id = table.Column<int>(type: "int", nullable: false)
                        .Annotation("SqlServer:Identity", "1, 1"),
                    UserId = table.Column<string>(type: "nvarchar(max)", nullable: true),
                    MediaId = table.Column<int>(type: "int", nullable: false),
                    Done = table.Column<bool>(type: "bit", nullable: false)
                },
                constraints: table =>
                {
                    table.PrimaryKey("PK_QuizQuestionsGroup", x => x.Id);
                });

            migrationBuilder.CreateTable(
                name: "QuizYears",
                columns: table => new
                {
                    Id = table.Column<int>(type: "int", nullable: false)
                        .Annotation("SqlServer:Identity", "1, 1"),
                    name = table.Column<string>(type: "nvarchar(max)", nullable: true)
                },
                constraints: table =>
                {
                    table.PrimaryKey("PK_QuizYears", x => x.Id);
                });

            migrationBuilder.CreateTable(
                name: "AspNetRoleClaims",
                columns: table => new
                {
                    Id = table.Column<int>(type: "int", nullable: false)
                        .Annotation("SqlServer:Identity", "1, 1"),
                    RoleId = table.Column<string>(type: "nvarchar(450)", nullable: false),
                    ClaimType = table.Column<string>(type: "nvarchar(max)", nullable: true),
                    ClaimValue = table.Column<string>(type: "nvarchar(max)", nullable: true)
                },
                constraints: table =>
                {
                    table.PrimaryKey("PK_AspNetRoleClaims", x => x.Id);
                    table.ForeignKey(
                        name: "FK_AspNetRoleClaims_AspNetRoles_RoleId",
                        column: x => x.RoleId,
                        principalTable: "AspNetRoles",
                        principalColumn: "Id",
                        onDelete: ReferentialAction.Cascade);
                });

            migrationBuilder.CreateTable(
                name: "AspNetUserClaims",
                columns: table => new
                {
                    Id = table.Column<int>(type: "int", nullable: false)
                        .Annotation("SqlServer:Identity", "1, 1"),
                    UserId = table.Column<string>(type: "nvarchar(450)", nullable: false),
                    ClaimType = table.Column<string>(type: "nvarchar(max)", nullable: true),
                    ClaimValue = table.Column<string>(type: "nvarchar(max)", nullable: true)
                },
                constraints: table =>
                {
                    table.PrimaryKey("PK_AspNetUserClaims", x => x.Id);
                    table.ForeignKey(
                        name: "FK_AspNetUserClaims_AspNetUsers_UserId",
                        column: x => x.UserId,
                        principalTable: "AspNetUsers",
                        principalColumn: "Id",
                        onDelete: ReferentialAction.Cascade);
                });

            migrationBuilder.CreateTable(
                name: "AspNetUserLogins",
                columns: table => new
                {
                    LoginProvider = table.Column<string>(type: "nvarchar(450)", nullable: false),
                    ProviderKey = table.Column<string>(type: "nvarchar(450)", nullable: false),
                    ProviderDisplayName = table.Column<string>(type: "nvarchar(max)", nullable: true),
                    UserId = table.Column<string>(type: "nvarchar(450)", nullable: false)
                },
                constraints: table =>
                {
                    table.PrimaryKey("PK_AspNetUserLogins", x => new { x.LoginProvider, x.ProviderKey });
                    table.ForeignKey(
                        name: "FK_AspNetUserLogins_AspNetUsers_UserId",
                        column: x => x.UserId,
                        principalTable: "AspNetUsers",
                        principalColumn: "Id",
                        onDelete: ReferentialAction.Cascade);
                });

            migrationBuilder.CreateTable(
                name: "AspNetUserRoles",
                columns: table => new
                {
                    UserId = table.Column<string>(type: "nvarchar(450)", nullable: false),
                    RoleId = table.Column<string>(type: "nvarchar(450)", nullable: false)
                },
                constraints: table =>
                {
                    table.PrimaryKey("PK_AspNetUserRoles", x => new { x.UserId, x.RoleId });
                    table.ForeignKey(
                        name: "FK_AspNetUserRoles_AspNetRoles_RoleId",
                        column: x => x.RoleId,
                        principalTable: "AspNetRoles",
                        principalColumn: "Id",
                        onDelete: ReferentialAction.Cascade);
                    table.ForeignKey(
                        name: "FK_AspNetUserRoles_AspNetUsers_UserId",
                        column: x => x.UserId,
                        principalTable: "AspNetUsers",
                        principalColumn: "Id",
                        onDelete: ReferentialAction.Cascade);
                });

            migrationBuilder.CreateTable(
                name: "AspNetUserTokens",
                columns: table => new
                {
                    UserId = table.Column<string>(type: "nvarchar(450)", nullable: false),
                    LoginProvider = table.Column<string>(type: "nvarchar(450)", nullable: false),
                    Name = table.Column<string>(type: "nvarchar(450)", nullable: false),
                    Value = table.Column<string>(type: "nvarchar(max)", nullable: true)
                },
                constraints: table =>
                {
                    table.PrimaryKey("PK_AspNetUserTokens", x => new { x.UserId, x.LoginProvider, x.Name });
                    table.ForeignKey(
                        name: "FK_AspNetUserTokens_AspNetUsers_UserId",
                        column: x => x.UserId,
                        principalTable: "AspNetUsers",
                        principalColumn: "Id",
                        onDelete: ReferentialAction.Cascade);
                });

            migrationBuilder.CreateTable(
                name: "UserMedia",
                columns: table => new
                {
                    Id = table.Column<int>(type: "int", nullable: false)
                        .Annotation("SqlServer:Identity", "1, 1"),
                    UserId = table.Column<string>(type: "nvarchar(max)", nullable: true),
                    IdTableMedia = table.Column<int>(type: "int", nullable: false),
                    IdListMedia = table.Column<int>(type: "int", nullable: true)
                },
                constraints: table =>
                {
                    table.PrimaryKey("PK_UserMedia", x => x.Id);
                    table.ForeignKey(
                        name: "FK_UserMedia_MediaInfoModel_IdTableMedia",
                        column: x => x.IdTableMedia,
                        principalTable: "MediaInfoModel",
                        principalColumn: "IdTableMedia",
                        onDelete: ReferentialAction.Cascade);
                    table.ForeignKey(
                        name: "FK_UserMedia_MediaListModel_IdListMedia",
                        column: x => x.IdListMedia,
                        principalTable: "MediaListModel",
                        principalColumn: "Id");
                });

            migrationBuilder.CreateTable(
                name: "QuizQuestion",
                columns: table => new
                {
                    Id = table.Column<int>(type: "int", nullable: false)
                        .Annotation("SqlServer:Identity", "1, 1"),
                    IdQuizQuestions = table.Column<int>(type: "int", nullable: false),
                    IdQuizQuestionsGroup = table.Column<int>(type: "int", nullable: false)
                },
                constraints: table =>
                {
                    table.PrimaryKey("PK_QuizQuestion", x => x.Id);
                    table.ForeignKey(
                        name: "FK_QuizQuestion_QuizQuestionsGroup_IdQuizQuestionsGroup",
                        column: x => x.IdQuizQuestionsGroup,
                        principalTable: "QuizQuestionsGroup",
                        principalColumn: "Id",
                        onDelete: ReferentialAction.Cascade);
                    table.ForeignKey(
                        name: "FK_QuizQuestion_QuizQuestions_IdQuizQuestions",
                        column: x => x.IdQuizQuestions,
                        principalTable: "QuizQuestions",
                        principalColumn: "Id",
                        onDelete: ReferentialAction.Cascade);
                });

            migrationBuilder.CreateTable(
                name: "QuizOption",
                columns: table => new
                {
                    Id = table.Column<int>(type: "int", nullable: false)
                        .Annotation("SqlServer:Identity", "1, 1"),
                    name = table.Column<string>(type: "nvarchar(max)", nullable: true),
                    answer = table.Column<bool>(type: "bit", nullable: false),
                    selected = table.Column<bool>(type: "bit", nullable: false),
                    IdQuizQuestion = table.Column<int>(type: "int", nullable: false),
                    IdQuizQuestions = table.Column<int>(type: "int", nullable: true)
                },
                constraints: table =>
                {
                    table.PrimaryKey("PK_QuizOption", x => x.Id);
                    table.ForeignKey(
                        name: "FK_QuizOption_QuizQuestion_IdQuizQuestions",
                        column: x => x.IdQuizQuestions,
                        principalTable: "QuizQuestion",
                        principalColumn: "Id");
                });

            migrationBuilder.InsertData(
                table: "MediaListModel",
                columns: new[] { "Id", "ListName" },
                values: new object[,]
                {
                    { 1, "Filmes" },
                    { 2, "Séries" },
                    { 3, "Ver Mais Tarde Series" },
                    { 4, "Ver Mais Tarde Filmes" },
                    { 5, "Favoritos" }
                });

            migrationBuilder.InsertData(
                table: "QuizCategorys",
                columns: new[] { "Id", "name" },
                values: new object[,]
                {
                    { 1, "Horror" },
                    { 2, "Terror" },
                    { 3, "Comedy" },
                    { 4, "Adventure" },
                    { 5, "Animation" },
                    { 6, "Drama" },
                    { 7, "Thriller" },
                    { 8, "Crime" },
                    { 9, "Television" },
                    { 10, "Western" },
                    { 11, "Romance" },
                    { 12, "Science fiction" },
                    { 13, "Fantasy" },
                    { 14, "Historical" },
                    { 15, "Documentary" },
                    { 16, "Musical" },
                    { 17, "Science" },
                    { 18, "War" },
                    { 19, "Cyberpunk" },
                    { 20, "Short" }
                });

            migrationBuilder.InsertData(
                table: "QuizNames",
                columns: new[] { "Id", "name" },
                values: new object[,]
                {
                    { 1, "Martin Luther" },
                    { 2, "Albert Einstein" },
                    { 3, "Abraham Lincoln" },
                    { 4, "Bob Ross" },
                    { 5, "Robin Williams" },
                    { 6, "Stan Lee" },
                    { 7, "Elvis Presley" },
                    { 8, "John Lennon" },
                    { 9, "Freddie Mercury" },
                    { 10, "Alan Rickman" },
                    { 11, "Marilyn Monroe" },
                    { 12, "Heath Ledger" },
                    { 13, "Steve Irwin" },
                    { 14, "Bruce Lee" },
                    { 15, "John Candy" },
                    { 16, "Carrie Fisher" },
                    { 17, "George Harrison" },
                    { 18, "Walt Disney" },
                    { 19, "Gene Wilder" },
                    { 20, "Anne Frank" },
                    { 21, "Mark Twain" },
                    { 22, "Paul Walker" },
                    { 23, "Johnny Cash" },
                    { 24, "David Bowie" },
                    { 25, "Nikola Tesla" },
                    { 26, "Audrey Hepburn" },
                    { 27, "Jimi Hendrix" },
                    { 28, "Michael Clarke" },
                    { 29, "Amadeus Mozart" },
                    { 30, "Mahatma Gandhi" }
                });

            migrationBuilder.InsertData(
                table: "QuizQuestions",
                columns: new[] { "Id", "name", "type" },
                values: new object[,]
                {
                    { 1, "Este filme pertence a que categoria(s)?", 0 },
                    { 2, "Atores que fizeram parte do elenco.", 1 },
                    { 3, "Em que ano saiu o filme?", 2 },
                    { 4, "Nome de personagens deste filme.", 3 },
                    { 5, "Realizador(es) deste filme.", 4 }
                });

            migrationBuilder.InsertData(
                table: "QuizYears",
                columns: new[] { "Id", "name" },
                values: new object[,]
                {
                    { 1, "2010" },
                    { 2, "2100" },
                    { 3, "1600" },
                    { 4, "3010" },
                    { 5, "2102" }
                });

            migrationBuilder.CreateIndex(
                name: "IX_AspNetRoleClaims_RoleId",
                table: "AspNetRoleClaims",
                column: "RoleId");

            migrationBuilder.CreateIndex(
                name: "RoleNameIndex",
                table: "AspNetRoles",
                column: "NormalizedName",
                unique: true,
                filter: "[NormalizedName] IS NOT NULL");

            migrationBuilder.CreateIndex(
                name: "IX_AspNetUserClaims_UserId",
                table: "AspNetUserClaims",
                column: "UserId");

            migrationBuilder.CreateIndex(
                name: "IX_AspNetUserLogins_UserId",
                table: "AspNetUserLogins",
                column: "UserId");

            migrationBuilder.CreateIndex(
                name: "IX_AspNetUserRoles_RoleId",
                table: "AspNetUserRoles",
                column: "RoleId");

            migrationBuilder.CreateIndex(
                name: "EmailIndex",
                table: "AspNetUsers",
                column: "NormalizedEmail");

            migrationBuilder.CreateIndex(
                name: "UserNameIndex",
                table: "AspNetUsers",
                column: "NormalizedUserName",
                unique: true,
                filter: "[NormalizedUserName] IS NOT NULL");

            migrationBuilder.CreateIndex(
                name: "IX_QuizOption_IdQuizQuestions",
                table: "QuizOption",
                column: "IdQuizQuestions");

            migrationBuilder.CreateIndex(
                name: "IX_QuizQuestion_IdQuizQuestions",
                table: "QuizQuestion",
                column: "IdQuizQuestions");

            migrationBuilder.CreateIndex(
                name: "IX_QuizQuestion_IdQuizQuestionsGroup",
                table: "QuizQuestion",
                column: "IdQuizQuestionsGroup");

            migrationBuilder.CreateIndex(
                name: "IX_UserMedia_IdListMedia",
                table: "UserMedia",
                column: "IdListMedia");

            migrationBuilder.CreateIndex(
                name: "IX_UserMedia_IdTableMedia",
                table: "UserMedia",
                column: "IdTableMedia");
        }

        /// <inheritdoc />
        protected override void Down(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.DropTable(
                name: "AspNetRoleClaims");

            migrationBuilder.DropTable(
                name: "AspNetUserClaims");

            migrationBuilder.DropTable(
                name: "AspNetUserLogins");

            migrationBuilder.DropTable(
                name: "AspNetUserRoles");

            migrationBuilder.DropTable(
                name: "AspNetUserTokens");

            migrationBuilder.DropTable(
                name: "Followers");

            migrationBuilder.DropTable(
                name: "ProfileInfo");

            migrationBuilder.DropTable(
                name: "QuizCategorys");

            migrationBuilder.DropTable(
                name: "QuizMedia");

            migrationBuilder.DropTable(
                name: "QuizNames");

            migrationBuilder.DropTable(
                name: "QuizOption");

            migrationBuilder.DropTable(
                name: "QuizYears");

            migrationBuilder.DropTable(
                name: "UserMedia");

            migrationBuilder.DropTable(
                name: "AspNetRoles");

            migrationBuilder.DropTable(
                name: "AspNetUsers");

            migrationBuilder.DropTable(
                name: "QuizQuestion");

            migrationBuilder.DropTable(
                name: "MediaInfoModel");

            migrationBuilder.DropTable(
                name: "MediaListModel");

            migrationBuilder.DropTable(
                name: "QuizQuestionsGroup");

            migrationBuilder.DropTable(
                name: "QuizQuestions");
        }
    }
}
