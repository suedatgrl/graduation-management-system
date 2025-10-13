using Microsoft.EntityFrameworkCore.Migrations;

#nullable disable

namespace GraduationProjectManagement.Migrations
{
    /// <inheritdoc />
    public partial class Update : Migration
    {
        /// <inheritdoc />
        protected override void Up(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.DropColumn(
                name: "ApplicationLetter",
                table: "ProjectApplications");
        }

        /// <inheritdoc />
        protected override void Down(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.AddColumn<string>(
                name: "ApplicationLetter",
                table: "ProjectApplications",
                type: "text",
                nullable: true);
        }
    }
}
