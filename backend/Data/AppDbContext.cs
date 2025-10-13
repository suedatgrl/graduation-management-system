using Microsoft.EntityFrameworkCore;
using GraduationProjectManagement.Models;

namespace GraduationProjectManagement.Data
{
    public class AppDbContext : DbContext
    {
        public AppDbContext(DbContextOptions<AppDbContext> options) : base(options)
        {
        }

        public DbSet<User> Users { get; set; }
        public DbSet<Project> Projects { get; set; }
        public DbSet<ProjectApplication> ProjectApplications { get; set; }
        public DbSet<SystemSettings> SystemSettings { get; set; }

        protected override void OnModelCreating(ModelBuilder modelBuilder)
        {
            base.OnModelCreating(modelBuilder);

            // User configuration
            modelBuilder.Entity<User>(entity =>
            {
                entity.HasKey(e => e.Id);
                entity.HasIndex(e => e.Email).IsUnique();
                entity.Property(e => e.Email).IsRequired().HasMaxLength(255);
                entity.Property(e => e.FirstName).IsRequired().HasMaxLength(100);
                entity.Property(e => e.LastName).IsRequired().HasMaxLength(100);
                entity.Property(e => e.PasswordHash).IsRequired();
            });

            // Project configuration
            modelBuilder.Entity<Project>(entity =>
            {
                entity.HasKey(e => e.Id);
                entity.Property(e => e.Title).IsRequired().HasMaxLength(200);
                entity.Property(e => e.Description).IsRequired();
                
                entity.HasOne(p => p.Teacher)
                      .WithMany(u => u.Projects)
                      .HasForeignKey(p => p.TeacherId)
                      .OnDelete(DeleteBehavior.Restrict);
            });

            // ProjectApplication configuration
            modelBuilder.Entity<ProjectApplication>(entity =>
            {
                entity.HasKey(e => e.Id);
                
                entity.HasOne(pa => pa.Student)
                      .WithMany(u => u.Applications)
                      .HasForeignKey(pa => pa.StudentId)
                      .OnDelete(DeleteBehavior.Cascade);
                
                entity.HasOne(pa => pa.Project)
                      .WithMany(p => p.Applications)
                      .HasForeignKey(pa => pa.ProjectId)
                      .OnDelete(DeleteBehavior.Cascade);
                
                // Bir öğrenci aynı projeye birden fazla başvuru yapamaz
                entity.HasIndex(e => new { e.StudentId, e.ProjectId }).IsUnique();
            });

            // SystemSettings configuration
            modelBuilder.Entity<SystemSettings>(entity =>
            {
                entity.HasKey(e => e.Id);
                entity.HasIndex(e => e.Key).IsUnique();
                entity.Property(e => e.Key).IsRequired().HasMaxLength(100);
                entity.Property(e => e.Value).IsRequired();
            });

            // Seed data
            SeedData(modelBuilder);
        }
private void SeedData(ModelBuilder modelBuilder)
        {
string newPassword = "admin123";
string hashedPassword = BCrypt.Net.BCrypt.HashPassword(newPassword);
Console.WriteLine(hashedPassword); // Bu çıktıyı kopyalayın

    modelBuilder.Entity<User>().HasData(
        new User
        {
            Id = 1,
            FirstName = "Admin",
            LastName = "User",
            Email = "admin@university.edu",
            PasswordHash = "$2a$11$NSBPgA.VcvWwJIqf7eIRjemdwb.lD64GjdSu7Z2Wuy6By4kG.H2A2", // sabit bir hash
            Role = UserRole.Admin,
            CreatedAt = new DateTime(2024, 1, 1, 0, 0, 0, DateTimeKind.Utc), // SABİT TARİH
            IsActive = true
        }
    );

    modelBuilder.Entity<SystemSettings>().HasData(
        new SystemSettings
        {
            Id = 1,
            Key = "ApplicationDeadline",
            Value = "2025-12-31T23:59:59",
            Description = "Son başvuru tarihi",
            UpdatedAt = new DateTime(2024, 1, 1, 0, 0, 0, DateTimeKind.Utc), // SABİT TARİH
            UpdatedBy = 1
        },
        new SystemSettings
        {
            Id = 2,
            Key = "SelectionStartDate",
            Value = "2025-12-31T23:59:59",
            Description = "Proje seçimi başlangıç tarihi",
            UpdatedAt = new DateTime(2024, 1, 1, 0, 0, 0, DateTimeKind.Utc), // SABİT TARİH
            UpdatedBy = 1
        }
    );
}
    }
}