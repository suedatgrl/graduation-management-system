using System;
using Microsoft.EntityFrameworkCore.Migrations;
using Npgsql.EntityFrameworkCore.PostgreSQL.Metadata;

#nullable disable

#pragma warning disable CA1814 // Prefer jagged arrays over multidimensional

namespace GraduationProjectManagement.Migrations
{
    /// <inheritdoc />
    public partial class InitialCreateWithNotifications : Migration
    {
        /// <inheritdoc />
        protected override void Up(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.CreateTable(
                name: "SystemSettings",
                columns: table => new
                {
                    Id = table.Column<int>(type: "integer", nullable: false)
                        .Annotation("Npgsql:ValueGenerationStrategy", NpgsqlValueGenerationStrategy.IdentityByDefaultColumn),
                    Key = table.Column<string>(type: "character varying(100)", maxLength: 100, nullable: false),
                    Value = table.Column<string>(type: "text", nullable: false),
                    Description = table.Column<string>(type: "text", nullable: true),
                    UpdatedAt = table.Column<DateTime>(type: "timestamp with time zone", nullable: false),
                    UpdatedBy = table.Column<int>(type: "integer", nullable: false)
                },
                constraints: table =>
                {
                    table.PrimaryKey("PK_SystemSettings", x => x.Id);
                });

            migrationBuilder.CreateTable(
                name: "Users",
                columns: table => new
                {
                    Id = table.Column<int>(type: "integer", nullable: false)
                        .Annotation("Npgsql:ValueGenerationStrategy", NpgsqlValueGenerationStrategy.IdentityByDefaultColumn),
                    FirstName = table.Column<string>(type: "character varying(100)", maxLength: 100, nullable: false),
                    LastName = table.Column<string>(type: "character varying(100)", maxLength: 100, nullable: false),
                    Email = table.Column<string>(type: "character varying(255)", maxLength: 255, nullable: false),
                    PasswordHash = table.Column<string>(type: "text", nullable: false),
                    Role = table.Column<int>(type: "integer", nullable: false),
                    StudentNumber = table.Column<string>(type: "character varying(20)", maxLength: 20, nullable: true),
                    CourseCode = table.Column<string>(type: "text", nullable: true),
                    TcIdentityNumber = table.Column<string>(type: "character varying(11)", maxLength: 11, nullable: true),
                    TotalQuota = table.Column<int>(type: "integer", nullable: true),
                    PasswordResetToken = table.Column<string>(type: "text", nullable: true),
                    PasswordResetTokenExpiry = table.Column<DateTime>(type: "timestamp with time zone", nullable: true),
                    CreatedAt = table.Column<DateTime>(type: "timestamp with time zone", nullable: false),
                    IsActive = table.Column<bool>(type: "boolean", nullable: false)
                },
                constraints: table =>
                {
                    table.PrimaryKey("PK_Users", x => x.Id);
                });

            migrationBuilder.CreateTable(
                name: "Projects",
                columns: table => new
                {
                    Id = table.Column<int>(type: "integer", nullable: false)
                        .Annotation("Npgsql:ValueGenerationStrategy", NpgsqlValueGenerationStrategy.IdentityByDefaultColumn),
                    Title = table.Column<string>(type: "character varying(200)", maxLength: 200, nullable: false),
                    Description = table.Column<string>(type: "text", nullable: false),
                    Details = table.Column<string>(type: "text", nullable: false),
                    CourseCode = table.Column<string>(type: "character varying(10)", maxLength: 10, nullable: false),
                    TeacherId = table.Column<int>(type: "integer", nullable: false),
                    MaxStudents = table.Column<int>(type: "integer", nullable: false),
                    CurrentStudents = table.Column<int>(type: "integer", nullable: false),
                    TotalApplications = table.Column<int>(type: "integer", nullable: false),
                    CreatedAt = table.Column<DateTime>(type: "timestamp with time zone", nullable: false),
                    IsActive = table.Column<bool>(type: "boolean", nullable: false)
                },
                constraints: table =>
                {
                    table.PrimaryKey("PK_Projects", x => x.Id);
                    table.ForeignKey(
                        name: "FK_Projects_Users_TeacherId",
                        column: x => x.TeacherId,
                        principalTable: "Users",
                        principalColumn: "Id",
                        onDelete: ReferentialAction.Cascade);
                });

            migrationBuilder.CreateTable(
                name: "ProjectApplications",
                columns: table => new
                {
                    Id = table.Column<int>(type: "integer", nullable: false)
                        .Annotation("Npgsql:ValueGenerationStrategy", NpgsqlValueGenerationStrategy.IdentityByDefaultColumn),
                    StudentId = table.Column<int>(type: "integer", nullable: false),
                    ProjectId = table.Column<int>(type: "integer", nullable: false),
                    Status = table.Column<int>(type: "integer", nullable: false),
                    AppliedAt = table.Column<DateTime>(type: "timestamp with time zone", nullable: false),
                    ReviewedAt = table.Column<DateTime>(type: "timestamp with time zone", nullable: true),
                    ReviewNotes = table.Column<string>(type: "text", nullable: true)
                },
                constraints: table =>
                {
                    table.PrimaryKey("PK_ProjectApplications", x => x.Id);
                    table.ForeignKey(
                        name: "FK_ProjectApplications_Projects_ProjectId",
                        column: x => x.ProjectId,
                        principalTable: "Projects",
                        principalColumn: "Id",
                        onDelete: ReferentialAction.Cascade);
                    table.ForeignKey(
                        name: "FK_ProjectApplications_Users_StudentId",
                        column: x => x.StudentId,
                        principalTable: "Users",
                        principalColumn: "Id",
                        onDelete: ReferentialAction.Cascade);
                });

            migrationBuilder.CreateTable(
                name: "ProjectQuotaAlerts",
                columns: table => new
                {
                    Id = table.Column<int>(type: "integer", nullable: false)
                        .Annotation("Npgsql:ValueGenerationStrategy", NpgsqlValueGenerationStrategy.IdentityByDefaultColumn),
                    StudentId = table.Column<int>(type: "integer", nullable: false),
                    ProjectId = table.Column<int>(type: "integer", nullable: false),
                    IsActive = table.Column<bool>(type: "boolean", nullable: false),
                    IsNotified = table.Column<bool>(type: "boolean", nullable: false),
                    CreatedAt = table.Column<DateTime>(type: "timestamp with time zone", nullable: false),
                    NotifiedAt = table.Column<DateTime>(type: "timestamp with time zone", nullable: true)
                },
                constraints: table =>
                {
                    table.PrimaryKey("PK_ProjectQuotaAlerts", x => x.Id);
                    table.ForeignKey(
                        name: "FK_ProjectQuotaAlerts_Projects_ProjectId",
                        column: x => x.ProjectId,
                        principalTable: "Projects",
                        principalColumn: "Id",
                        onDelete: ReferentialAction.Cascade);
                    table.ForeignKey(
                        name: "FK_ProjectQuotaAlerts_Users_StudentId",
                        column: x => x.StudentId,
                        principalTable: "Users",
                        principalColumn: "Id",
                        onDelete: ReferentialAction.Cascade);
                });

            migrationBuilder.CreateTable(
                name: "Notifications",
                columns: table => new
                {
                    Id = table.Column<int>(type: "integer", nullable: false)
                        .Annotation("Npgsql:ValueGenerationStrategy", NpgsqlValueGenerationStrategy.IdentityByDefaultColumn),
                    UserId = table.Column<int>(type: "integer", nullable: false),
                    Type = table.Column<int>(type: "integer", nullable: false),
                    Title = table.Column<string>(type: "character varying(200)", maxLength: 200, nullable: false),
                    Message = table.Column<string>(type: "text", nullable: false),
                    RelatedProjectId = table.Column<int>(type: "integer", nullable: true),
                    RelatedApplicationId = table.Column<int>(type: "integer", nullable: true),
                    IsRead = table.Column<bool>(type: "boolean", nullable: false),
                    IsEmailSent = table.Column<bool>(type: "boolean", nullable: false),
                    CreatedAt = table.Column<DateTime>(type: "timestamp with time zone", nullable: false),
                    ReadAt = table.Column<DateTime>(type: "timestamp with time zone", nullable: true)
                },
                constraints: table =>
                {
                    table.PrimaryKey("PK_Notifications", x => x.Id);
                    table.ForeignKey(
                        name: "FK_Notifications_ProjectApplications_RelatedApplicationId",
                        column: x => x.RelatedApplicationId,
                        principalTable: "ProjectApplications",
                        principalColumn: "Id",
                        onDelete: ReferentialAction.SetNull);
                    table.ForeignKey(
                        name: "FK_Notifications_Projects_RelatedProjectId",
                        column: x => x.RelatedProjectId,
                        principalTable: "Projects",
                        principalColumn: "Id",
                        onDelete: ReferentialAction.SetNull);
                    table.ForeignKey(
                        name: "FK_Notifications_Users_UserId",
                        column: x => x.UserId,
                        principalTable: "Users",
                        principalColumn: "Id",
                        onDelete: ReferentialAction.Cascade);
                });

            migrationBuilder.InsertData(
                table: "SystemSettings",
                columns: new[] { "Id", "Description", "Key", "UpdatedAt", "UpdatedBy", "Value" },
                values: new object[,]
                {
                    { 1, "Proje başvuruları için son tarih", "ApplicationDeadline", new DateTime(2024, 1, 1, 0, 0, 0, 0, DateTimeKind.Utc), 1, "2025-12-31T23:59:59.0000000Z" },
                    { 2, "Sistem adı", "SystemName", new DateTime(2024, 1, 1, 0, 0, 0, 0, DateTimeKind.Utc), 1, "Bitirme Projesi Yönetim Sistemi" },
                    { 3, "Öğretmen başına maksimum proje sayısı", "MaxProjectsPerTeacher", new DateTime(2024, 1, 1, 0, 0, 0, 0, DateTimeKind.Utc), 1, "10" }
                });

            migrationBuilder.InsertData(
                table: "Users",
                columns: new[] { "Id", "CourseCode", "CreatedAt", "Email", "FirstName", "IsActive", "LastName", "PasswordHash", "PasswordResetToken", "PasswordResetTokenExpiry", "Role", "StudentNumber", "TcIdentityNumber", "TotalQuota" },
                values: new object[] { 1, null, new DateTime(2024, 1, 1, 0, 0, 0, 0, DateTimeKind.Utc), "admin@university.edu", "Admin", true, "User", "$2a$11$NSBPgA.VcvWwJIqf7eIRjemdwb.lD64GjdSu7Z2Wuy6By4kG.H2A2", null, null, 3, null, "12345678901", null });

            migrationBuilder.CreateIndex(
                name: "IX_Notifications_CreatedAt",
                table: "Notifications",
                column: "CreatedAt");

            migrationBuilder.CreateIndex(
                name: "IX_Notifications_RelatedApplicationId",
                table: "Notifications",
                column: "RelatedApplicationId");

            migrationBuilder.CreateIndex(
                name: "IX_Notifications_RelatedProjectId",
                table: "Notifications",
                column: "RelatedProjectId");

            migrationBuilder.CreateIndex(
                name: "IX_Notifications_UserId_IsRead",
                table: "Notifications",
                columns: new[] { "UserId", "IsRead" });

            migrationBuilder.CreateIndex(
                name: "IX_ProjectApplications_ProjectId_Status",
                table: "ProjectApplications",
                columns: new[] { "ProjectId", "Status" });

            migrationBuilder.CreateIndex(
                name: "IX_ProjectApplications_StudentId_ProjectId",
                table: "ProjectApplications",
                columns: new[] { "StudentId", "ProjectId" },
                unique: true);

            migrationBuilder.CreateIndex(
                name: "IX_ProjectQuotaAlerts_ProjectId",
                table: "ProjectQuotaAlerts",
                column: "ProjectId");

            migrationBuilder.CreateIndex(
                name: "IX_ProjectQuotaAlerts_StudentId_ProjectId_IsActive",
                table: "ProjectQuotaAlerts",
                columns: new[] { "StudentId", "ProjectId", "IsActive" });

            migrationBuilder.CreateIndex(
                name: "IX_Projects_CourseCode",
                table: "Projects",
                column: "CourseCode");

            migrationBuilder.CreateIndex(
                name: "IX_Projects_TeacherId_IsActive",
                table: "Projects",
                columns: new[] { "TeacherId", "IsActive" });

            migrationBuilder.CreateIndex(
                name: "IX_SystemSettings_Key",
                table: "SystemSettings",
                column: "Key",
                unique: true);

            migrationBuilder.CreateIndex(
                name: "IX_Users_Email",
                table: "Users",
                column: "Email",
                unique: true);

            migrationBuilder.CreateIndex(
                name: "IX_Users_StudentNumber",
                table: "Users",
                column: "StudentNumber");

            migrationBuilder.CreateIndex(
                name: "IX_Users_TcIdentityNumber",
                table: "Users",
                column: "TcIdentityNumber",
                unique: true);
        }

        /// <inheritdoc />
        protected override void Down(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.DropTable(
                name: "Notifications");

            migrationBuilder.DropTable(
                name: "ProjectQuotaAlerts");

            migrationBuilder.DropTable(
                name: "SystemSettings");

            migrationBuilder.DropTable(
                name: "ProjectApplications");

            migrationBuilder.DropTable(
                name: "Projects");

            migrationBuilder.DropTable(
                name: "Users");
        }
    }
}
