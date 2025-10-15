using Microsoft.EntityFrameworkCore.Migrations;

#nullable disable

namespace GraduationProjectManagement.Migrations
{
    /// <inheritdoc />
    public partial class Updatelogin : Migration
    {
        /// <inheritdoc />
        protected override void Up(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.DropColumn(
                name: "SchoolNumber",
                table: "Users");
        }

        /// <inheritdoc />
        protected override void Down(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.AddColumn<string>(
                name: "SchoolNumber",
                table: "Users",
                type: "text",
                nullable: true);

            migrationBuilder.UpdateData(
                table: "Users",
                keyColumn: "Id",
                keyValue: 1,
                column: "SchoolNumber",
                value: null);
        }
    }
}
