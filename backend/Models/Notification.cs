using System.ComponentModel.DataAnnotations;

namespace GraduationProjectManagement.Models
{
    public class Notification
    {
        public int Id { get; set; }
        
        [Required]
        public int UserId { get; set; }
        
        [Required]
        public NotificationType Type { get; set; }
        
        [Required]
        public string Title { get; set; } = string.Empty;
        
        [Required]
        public string Message { get; set; } = string.Empty;
        
        public int? RelatedProjectId { get; set; }
        public int? RelatedApplicationId { get; set; }
        
        public bool IsRead { get; set; } = false;
        public bool IsEmailSent { get; set; } = false;
        
        public DateTime CreatedAt { get; set; } = DateTime.UtcNow;
        public DateTime? ReadAt { get; set; }
        
        // Navigation properties
        public virtual User User { get; set; } = null!;
        public virtual Project? RelatedProject { get; set; }
        public virtual ProjectApplication? RelatedApplication { get; set; }
    }

    public enum NotificationType
    {
        ApplicationApproved = 1,      // Başvuru onaylandı
        ApplicationRejected = 2,      // Başvuru reddedildi
        DeadlineWarning = 3,          // Son tarih uyarısı
        QuotaAvailable = 4, // Kontenjan açıldı
        ReviewDeadlineWarning = 5
    }
}