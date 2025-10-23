using Microsoft.EntityFrameworkCore;
using GraduationProjectManagement.Data;
using GraduationProjectManagement.Models;
using GraduationProjectManagement.DTOs;

namespace GraduationProjectManagement.Services
{
    public class NotificationService : INotificationService
    {
        private readonly AppDbContext _context;
        private readonly IEmailService _emailService;

        public NotificationService(AppDbContext context, IEmailService emailService)
        {
            _context = context;
            _emailService = emailService;
        }

        public async Task<Notification> CreateNotificationAsync(
            int userId, 
            NotificationType type, 
            string title, 
            string message, 
            int? projectId = null, 
            int? applicationId = null)
        {
            var notification = new Notification
            {
                UserId = userId,
                Type = type,
                Title = title,
                Message = message,
                RelatedProjectId = projectId,
                RelatedApplicationId = applicationId,
                CreatedAt = DateTime.UtcNow,
                IsRead = false,
                IsEmailSent = false
            };

            _context.Notifications.Add(notification);
            await _context.SaveChangesAsync();

            // E-posta gönder
            try
            {
                var user = await _context.Users.FindAsync(userId);
                if (user != null)
                {
                    notification.User = user;
                    await _emailService.SendNotificationEmailAsync(notification);
                    notification.IsEmailSent = true;
                    await _context.SaveChangesAsync();
                }
            }
            catch (Exception ex)
            {
                Console.WriteLine($"Email gönderme hatası: {ex.Message}");
            }

            return notification;
        }

        public async Task<IEnumerable<NotificationDto>> GetUserNotificationsAsync(int userId)
        {
            var notifications = await _context.Notifications
                .Include(n => n.RelatedProject)
                    .ThenInclude(p => p.Teacher)
                .Where(n => n.UserId == userId)
                .OrderByDescending(n => n.CreatedAt)
                .ToListAsync();

            return notifications.Select(n => new NotificationDto
            {
                Id = n.Id,
                UserId = n.UserId,
                Type = (int)n.Type,
                TypeText = GetNotificationTypeText(n.Type),
                Title = n.Title,
                Message = n.Message,
                RelatedProjectId = n.RelatedProjectId,
                RelatedProjectTitle = n.RelatedProject?.Title,
                RelatedApplicationId = n.RelatedApplicationId,
                IsRead = n.IsRead,
                IsEmailSent = n.IsEmailSent,
                CreatedAt = n.CreatedAt,
                ReadAt = n.ReadAt
            });
        }

        public async Task<int> GetUnreadCountAsync(int userId)
        {
            return await _context.Notifications
                .CountAsync(n => n.UserId == userId && !n.IsRead);
        }

        public async Task<bool> MarkAsReadAsync(int notificationId, int userId)
        {
            var notification = await _context.Notifications
                .FirstOrDefaultAsync(n => n.Id == notificationId && n.UserId == userId);

            if (notification == null)
                return false;

            notification.IsRead = true;
            notification.ReadAt = DateTime.UtcNow;
            await _context.SaveChangesAsync();

            return true;
        }

        public async Task<bool> MarkAllAsReadAsync(int userId)
        {
            var notifications = await _context.Notifications
                .Where(n => n.UserId == userId && !n.IsRead)
                .ToListAsync();

            foreach (var notification in notifications)
            {
                notification.IsRead = true;
                notification.ReadAt = DateTime.UtcNow;
            }

            await _context.SaveChangesAsync();
            return true;
        }

        public async Task<bool> DeleteNotificationAsync(int notificationId, int userId)
        {
            var notification = await _context.Notifications
                .FirstOrDefaultAsync(n => n.Id == notificationId && n.UserId == userId);

            if (notification == null)
                return false;

            _context.Notifications.Remove(notification);
            await _context.SaveChangesAsync();

            return true;
        }

        // Quota Alert Methods
        public async Task<bool> CreateQuotaAlertAsync(int studentId, int projectId)
        {
            // Zaten var mı kontrol et
            var existing = await _context.ProjectQuotaAlerts
                .FirstOrDefaultAsync(pqa => pqa.StudentId == studentId && 
                                           pqa.ProjectId == projectId && 
                                           pqa.IsActive);

            if (existing != null)
                return false; // Zaten var

            var alert = new ProjectQuotaAlert
            {
                StudentId = studentId,
                ProjectId = projectId,
                IsActive = true,
                CreatedAt = DateTime.UtcNow
            };

            _context.ProjectQuotaAlerts.Add(alert);
            await _context.SaveChangesAsync();

            return true;
        }

        public async Task<bool> RemoveQuotaAlertAsync(int studentId, int projectId)
        {
            var alert = await _context.ProjectQuotaAlerts
                .FirstOrDefaultAsync(pqa => pqa.StudentId == studentId && 
                                           pqa.ProjectId == projectId && 
                                           pqa.IsActive);

            if (alert == null)
                return false;

            alert.IsActive = false;
            await _context.SaveChangesAsync();

            return true;
        }

        public async Task CheckAndNotifyQuotaAlertsAsync()
        {
            // Aktif alert'leri al
            var alerts = await _context.ProjectQuotaAlerts
                .Include(pqa => pqa.Student)
                .Include(pqa => pqa.Project)
                    .ThenInclude(p => p.Teacher)
                .Include(pqa => pqa.Project.Applications)
                .Where(pqa => pqa.IsActive && !pqa.IsNotified)
                .ToListAsync();

            foreach (var alert in alerts)
            {
                var project = alert.Project;
                
                // Kontenjan doluluk kontrolü
                var currentApplications = project.Applications
                    .Count(a => a.Status == ApplicationStatus.Pending || 
                               a.Status == ApplicationStatus.Approved);

                var maxApplications = project.MaxStudents + 2;
                
                // Kontenjan açıldı mı?
                if (currentApplications < maxApplications)
                {
                    // Bildirim oluştur
                    await CreateNotificationAsync(
                        alert.StudentId,
                        NotificationType.QuotaAvailable,
                        " Kontenjan Açıldı!",
                        $"'{project.Title}' projesinde kontenjan açıldı! Hemen başvurabilirsiniz.",
                        project.Id
                    );

                    // Email gönder
                    await _emailService.SendQuotaAlertEmailAsync(alert.Student, project);

                    // Alert'i işaretle
                    alert.IsNotified = true;
                    alert.NotifiedAt = DateTime.UtcNow;
                    alert.IsActive = false; // Artık aktif değil
                }
            }

            await _context.SaveChangesAsync();
        }

        // Deadline Warning Methods
        public async Task SendDeadlineWarningsAsync()
        {
            // Son başvuru tarihini al
            Console.WriteLine("🔔 SendDeadlineWarningsAsync başladı...");
            var deadlineSetting = await _context.SystemSettings
                .FirstOrDefaultAsync(s => s.Key == "ApplicationDeadline");

            if (deadlineSetting == null || string.IsNullOrEmpty(deadlineSetting.Value))
                return;

            if (!DateTime.TryParse(deadlineSetting.Value, out var deadline))
                return;

            var now = DateTime.UtcNow;
            var daysUntilDeadline = (deadline - now).Days;

            // Son 7 gün içinde miyiz?
            if (daysUntilDeadline < 0 || daysUntilDeadline > 7)
                return;

            // Başvurusu olmayan öğrencileri bul
            var studentsWithoutApplications = await _context.Users
                .Where(u => u.Role == UserRole.Student && u.IsActive)
                .Where(u => !u.Applications.Any(a => a.Status == ApplicationStatus.Pending ||
                                                    a.Status == ApplicationStatus.Approved))
                .ToListAsync();

            foreach (var student in studentsWithoutApplications)
            {
                // Bugün için bildirim gönderilmiş mi kontrol et
                var today = DateTime.UtcNow.Date;
                var alreadySentToday = await _context.Notifications
                    .AnyAsync(n => n.UserId == student.Id &&
                                  n.Type == NotificationType.DeadlineWarning &&
                                  n.CreatedAt.Date == today);

                if (alreadySentToday)
                    continue;

                // Bildirim oluştur
                var title = daysUntilDeadline == 0
                    ? "🚨 SON GÜN - Proje Seçimi!"
                    : $"⚠️ Son {daysUntilDeadline} Gün - Proje Seçimi";

                var message = daysUntilDeadline == 0
                    ? "Proje seçimi için bugün son gün! Lütfen acilen bir proje seçin."
                    : $"Henüz bir proje seçmediniz. Proje seçimi için {daysUntilDeadline} gün kaldı!";

                await CreateNotificationAsync(
                    student.Id,
                    NotificationType.DeadlineWarning,
                    title,
                    message
                );

                // Email gönder
                await _emailService.SendDeadlineWarningEmailAsync(student, daysUntilDeadline);
            }
        }
        
        public async Task SendReviewDeadlineWarningsAsync()
        {
            Console.WriteLine("🔔 SendReviewDeadlineWarningsAsync başladı...");
            
            // Son değerlendirme tarihini al
            var reviewDeadlineSetting = await _context.SystemSettings
                .FirstOrDefaultAsync(s => s.Key == "ReviewDeadline");

            if (reviewDeadlineSetting == null || string.IsNullOrEmpty(reviewDeadlineSetting.Value))
            {
                Console.WriteLine("⚠️ ReviewDeadline ayarı bulunamadı veya boş.");
                return;
            }

            if (!DateTime.TryParse(reviewDeadlineSetting.Value, out var reviewDeadline))
            {
                Console.WriteLine("⚠️ ReviewDeadline parse edilemedi.");
                return;
            }

            var now = DateTime.UtcNow;
            var daysUntilDeadline = (reviewDeadline - now).Days;

            Console.WriteLine($"📅 ReviewDeadline: {reviewDeadline}, Kalan Gün: {daysUntilDeadline}");

            // Son 7 gün içinde miyiz?
            if (daysUntilDeadline < 0 || daysUntilDeadline > 7)
            {
                Console.WriteLine("⏭️ Son 7 gün içinde değil, bildirim gönderilmeyecek.");
                return;
            }

            // Bekleyen başvurusu olan öğretmenleri bul
            var teachersWithPendingApplications = await _context.Users
                .Where(u => u.Role == UserRole.Teacher && u.IsActive)
                .Where(u => u.Projects.Any(p => p.Applications.Any(a => a.Status == ApplicationStatus.Pending)))
                .Include(u => u.Projects)
                    .ThenInclude(p => p.Applications)
                .ToListAsync();

            Console.WriteLine($"👨‍🏫 Bekleyen başvurusu olan {teachersWithPendingApplications.Count} öğretmen bulundu.");

            foreach (var teacher in teachersWithPendingApplications)
            {
                // Bekleyen başvuru sayısını hesapla
                var pendingCount = teacher.Projects
                    .SelectMany(p => p.Applications)
                    .Count(a => a.Status == ApplicationStatus.Pending);

                if (pendingCount == 0)
                    continue;

                // Bugün için bildirim gönderilmiş mi kontrol et
                var today = DateTime.UtcNow.Date;
                var alreadySentToday = await _context.Notifications
                    .AnyAsync(n => n.UserId == teacher.Id && 
                                  n.Type == NotificationType.ReviewDeadlineWarning &&
                                  n.CreatedAt.Date == today);

                if (alreadySentToday)
                {
                    Console.WriteLine($"✅ {teacher.FirstName} {teacher.LastName} için bugün bildirim gönderilmiş.");
                    continue;
                }

                // Bildirim oluştur
                var title = daysUntilDeadline == 0 
                    ? "🚨 SON GÜN - Başvuru Değerlendirme!" 
                    : $"⏰ Son {daysUntilDeadline} Gün - Başvuru Değerlendirme";

                var message = daysUntilDeadline == 0
                    ? $"Başvuruları değerlendirmek için bugün son gün! {pendingCount} bekleyen başvurunuz var."
                    : $"{pendingCount} bekleyen başvurunuz var. Değerlendirme için {daysUntilDeadline} gün kaldı!";

                await CreateNotificationAsync(
                    teacher.Id,
                    NotificationType.ReviewDeadlineWarning,
                    title,
                    message
                );

                Console.WriteLine($"✉️ {teacher.FirstName} {teacher.LastName} için bildirim gönderildi.");

                // Email gönder (opsiyonel)
                try
                {
                    await _emailService.SendReviewDeadlineWarningEmailAsync(teacher, daysUntilDeadline, pendingCount);
                }
                catch (Exception ex)
                {
                    Console.WriteLine($"Email gönderme hatası: {ex.Message}");
                }
            }

            Console.WriteLine("✅ SendReviewDeadlineWarningsAsync tamamlandı.");
        }

        private string GetNotificationTypeText(NotificationType type)
        {
            return type switch
            {
                NotificationType.ApplicationApproved => "Başvuru Onaylandı",
                NotificationType.ApplicationRejected => "Başvuru Reddedildi",
                NotificationType.DeadlineWarning => "Son Tarih Uyarısı",
                NotificationType.QuotaAvailable => "Kontenjan Açıldı",
                _ => "Bilinmeyen"
            };
        }
    }
}