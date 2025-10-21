using Microsoft.EntityFrameworkCore;
using GraduationProjectManagement.Models;

namespace GraduationProjectManagement.Data
{
    public class AppDbContext : DbContext
    {
        public AppDbContext(DbContextOptions<AppDbContext> options) : base(options)
        {
        }

        // DbSets
        public DbSet<User> Users { get; set; }
        public DbSet<Project> Projects { get; set; }
        public DbSet<ProjectApplication> ProjectApplications { get; set; }
        public DbSet<SystemSettings> SystemSettings { get; set; }
        
        // YENİ DbSets
        public DbSet<Notification> Notifications { get; set; }
        public DbSet<ProjectQuotaAlert> ProjectQuotaAlerts { get; set; }

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
                
                entity.HasIndex(e => e.TcIdentityNumber).IsUnique();
                entity.Property(e => e.TcIdentityNumber).HasMaxLength(11);
                
                entity.HasIndex(e => e.StudentNumber);
                entity.Property(e => e.StudentNumber).HasMaxLength(20);
            });

            // Project configuration
            modelBuilder.Entity<Project>(entity =>
            {
                entity.HasKey(e => e.Id);
                entity.Property(e => e.Title).IsRequired().HasMaxLength(200);
                entity.Property(e => e.Description).IsRequired();
                entity.Property(e => e.Details).IsRequired();
                entity.Property(e => e.CourseCode).IsRequired().HasMaxLength(10);
                
                entity.HasOne(p => p.Teacher)
                      .WithMany(u => u.Projects)
                      .HasForeignKey(p => p.TeacherId)
                      .OnDelete(DeleteBehavior.Cascade);

                entity.HasIndex(e => new { e.TeacherId, e.IsActive });
                entity.HasIndex(e => e.CourseCode);
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

                entity.HasIndex(e => new { e.StudentId, e.ProjectId }).IsUnique();
                entity.HasIndex(e => new { e.ProjectId, e.Status });
            });

            // SystemSettings configuration
            modelBuilder.Entity<SystemSettings>(entity =>
            {
                entity.HasKey(e => e.Id);
                entity.HasIndex(e => e.Key).IsUnique();
                entity.Property(e => e.Key).IsRequired().HasMaxLength(100);
                entity.Property(e => e.Value).IsRequired();
            });

            // YENİ: Notification configuration
            modelBuilder.Entity<Notification>(entity =>
            {
                entity.HasKey(e => e.Id);
                entity.Property(e => e.Title).IsRequired().HasMaxLength(200);
                entity.Property(e => e.Message).IsRequired();
                
                entity.HasOne(n => n.User)
                      .WithMany()
                      .HasForeignKey(n => n.UserId)
                      .OnDelete(DeleteBehavior.Cascade);
                
                entity.HasOne(n => n.RelatedProject)
                      .WithMany()
                      .HasForeignKey(n => n.RelatedProjectId)
                      .OnDelete(DeleteBehavior.SetNull)
                      .IsRequired(false);
                
                entity.HasOne(n => n.RelatedApplication)
                      .WithMany()
                      .HasForeignKey(n => n.RelatedApplicationId)
                      .OnDelete(DeleteBehavior.SetNull)
                      .IsRequired(false);
                      
                entity.HasIndex(e => new { e.UserId, e.IsRead });
                entity.HasIndex(e => e.CreatedAt);
            });

            // YENİ: ProjectQuotaAlert configuration
            modelBuilder.Entity<ProjectQuotaAlert>(entity =>
            {
                entity.HasKey(e => e.Id);
                
                entity.HasOne(pqa => pqa.Student)
                      .WithMany()
                      .HasForeignKey(pqa => pqa.StudentId)
                      .OnDelete(DeleteBehavior.Cascade);
                
                entity.HasOne(pqa => pqa.Project)
                      .WithMany()
                      .HasForeignKey(pqa => pqa.ProjectId)
                      .OnDelete(DeleteBehavior.Cascade);
                
                // Aynı öğrenci aynı projeye birden fazla aktif alert ekleyemez
                entity.HasIndex(e => new { e.StudentId, e.ProjectId, e.IsActive });
            });

            // Seed Data
            SeedData(modelBuilder);
        }

private void SeedData(ModelBuilder modelBuilder)
{
    // SABİT TARİHLER
    var seedDate = new DateTime(2024, 1, 1, 0, 0, 0, DateTimeKind.Utc);
    var deadlineDate = new DateTime(2025, 12, 31, 23, 59, 59, DateTimeKind.Utc);

    // SABİT ŞİFRE HASH - BCrypt.HashPassword kullanmayın seed data'da!
    // Bu hash "admin123" şifresine karşılık gelir
    var adminPasswordHash = "$2a$11$NSBPgA.VcvWwJIqf7eIRjemdwb.lD64GjdSu7Z2Wuy6By4kG.H2A2";

    // Admin user seed
    modelBuilder.Entity<User>().HasData(new User
    {
        Id = 1,
        FirstName = "Admin",
        LastName = "User",
        Email = "admin@university.edu",
        PasswordHash = adminPasswordHash,  // ← SABİT HASH
        Role = UserRole.Admin,
        IsActive = true,
        CreatedAt = seedDate,
        TcIdentityNumber = "12345678901"
    });

    // SystemSettings seed
    modelBuilder.Entity<SystemSettings>().HasData(
        new SystemSettings
        {
            Id = 1,
            Key = "ApplicationDeadline",
            Value = deadlineDate.ToString("o"),
            Description = "Proje başvuruları için son tarih",
            UpdatedAt = seedDate,
            UpdatedBy = 1
        },
        new SystemSettings
        {
            Id = 2,
            Key = "SystemName",
            Value = "Bitirme Projesi Yönetim Sistemi",
            Description = "Sistem adı",
            UpdatedAt = seedDate,
            UpdatedBy = 1
        },
        new SystemSettings
        {
            Id = 3,
            Key = "MaxProjectsPerTeacher",
            Value = "10",
            Description = "Öğretmen başına maksimum proje sayısı",
            UpdatedAt = seedDate,
            UpdatedBy = 1
        }
    );
}
    }
}