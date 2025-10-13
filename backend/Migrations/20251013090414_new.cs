using Microsoft.EntityFrameworkCore.Migrations;

#nullable disable

namespace GraduationProjectManagement.Migrations
{
    /// <inheritdoc />
    public partial class @new : Migration
    {
        /// <inheritdoc />
        protected override void Up(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.DropColumn(
                name: "Department",
                table: "Projects");

            migrationBuilder.DropColumn(
                name: "Keywords",
                table: "Projects");

            migrationBuilder.DropColumn(
                name: "Requirements",
                table: "Projects");

            migrationBuilder.DropColumn(
                name: "ReviewNotes",
                table: "ProjectApplications");

            migrationBuilder.AlterColumn<string>(
                name: "CourseCode",
                table: "Projects",
                type: "text",
                nullable: false,
                defaultValue: "",
                oldClrType: typeof(string),
                oldType: "text",
                oldNullable: true);
        }

        /// <inheritdoc />
        protected override void Down(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.AlterColumn<string>(
                name: "CourseCode",
                table: "Projects",
                type: "text",
                nullable: true,
                oldClrType: typeof(string),
                oldType: "text");

            migrationBuilder.AddColumn<int>(
                name: "Department",
                table: "Projects",
                type: "integer",
                nullable: false,
                defaultValue: 0);

            migrationBuilder.AddColumn<string>(
                name: "Keywords",
                table: "Projects",
                type: "text",
                nullable: true);

            migrationBuilder.AddColumn<string>(
                name: "Requirements",
                table: "Projects",
                type: "text",
                nullable: true);

            migrationBuilder.AddColumn<string>(
                name: "ReviewNotes",
                table: "ProjectApplications",
                type: "text",
                nullable: true);
        }
    }
}
