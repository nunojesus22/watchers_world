using Microsoft.EntityFrameworkCore.Migrations;

#nullable disable

namespace WatchersWorld.Server.Migrations
{
    /// <inheritdoc />
    public partial class Updated : Migration
    {
        /// <inheritdoc />
        protected override void Up(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.CreateIndex(
                name: "IX_UserMedia_IdTableMedia",
                table: "UserMedia",
                column: "IdTableMedia");

            migrationBuilder.AddForeignKey(
                name: "FK_UserMedia_MediaInfoModel_IdTableMedia",
                table: "UserMedia",
                column: "IdTableMedia",
                principalTable: "MediaInfoModel",
                principalColumn: "IdTableMedia",
                onDelete: ReferentialAction.Cascade);
        }

        /// <inheritdoc />
        protected override void Down(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.DropForeignKey(
                name: "FK_UserMedia_MediaInfoModel_IdTableMedia",
                table: "UserMedia");

            migrationBuilder.DropIndex(
                name: "IX_UserMedia_IdTableMedia",
                table: "UserMedia");
        }
    }
}
