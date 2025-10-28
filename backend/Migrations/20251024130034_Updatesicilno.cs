using Microsoft.EntityFrameworkCore.Migrations;

#nullable disable

namespace GraduationProjectManagement.Migrations
{
    /// <inheritdoc />
    public partial class Updatesicilno : Migration
    {
        /// <inheritdoc />
        protected override void Up(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.DropIndex(
                name: "IX_Users_TcIdentityNumber",
                table: "Users");

            migrationBuilder.DropColumn(
                name: "TcIdentityNumber",
                table: "Users");

            migrationBuilder.AddColumn<string>(
                name: "SicilNumber",
                table: "Users",
                type: "character varying(20)",
                maxLength: 20,
                nullable: true);

            migrationBuilder.UpdateData(
                table: "Users",
                keyColumn: "Id",
                keyValue: 1,
                column: "SicilNumber",
                value: null);

            migrationBuilder.CreateIndex(
                name: "IX_Users_SicilNumber",
                table: "Users",
                column: "SicilNumber",
                unique: true);
        }

        /// <inheritdoc />
        protected override void Down(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.DropIndex(
                name: "IX_Users_SicilNumber",
                table: "Users");

            migrationBuilder.DropColumn(
                name: "SicilNumber",
                table: "Users");

            migrationBuilder.AddColumn<string>(
                name: "TcIdentityNumber",
                table: "Users",
                type: "character varying(11)",
                maxLength: 11,
                nullable: true);

            migrationBuilder.UpdateData(
                table: "Users",
                keyColumn: "Id",
                keyValue: 1,
                column: "TcIdentityNumber",
                value: "12345678901");

            migrationBuilder.CreateIndex(
                name: "IX_Users_TcIdentityNumber",
                table: "Users",
                column: "TcIdentityNumber",
                unique: true);
        }
    }
}
