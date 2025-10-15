using System.ComponentModel.DataAnnotations;

namespace GraduationProjectManagement.Models
{
    public class Project
    {
        public int Id { get; set; }

        [Required]
        [StringLength(200)]
        public string Title { get; set; } = string.Empty;

        [Required]
        public string Description { get; set; } = string.Empty;

        [Required]
        public string Details { get; set; } = string.Empty;

        [Required]
        public string CourseCode { get; set; } = string.Empty; // BLM for Turkish, COM for English

        [Required]
        public int TeacherId { get; set; }

        [Range(1, 10)]
        public int MaxStudents { get; set; } = 1;

        // Onaylanan öğrenci sayısı
        public int CurrentStudents { get; set; } = 0;

        // Toplam başvuru sayısı (pending + approved)
        public int TotalApplications { get; set; } = 0;

        public DateTime CreatedAt { get; set; } = DateTime.UtcNow;

        public bool IsActive { get; set; } = true;

        // Navigation properties
        public virtual User Teacher { get; set; } = null!;
        public virtual ICollection<ProjectApplication> Applications { get; set; } = new List<ProjectApplication>();

        // Computed properties
        public int MaxApplications => MaxStudents + 2; // Max öğrenci + 2
        public int RemainingApplicationSlots => Math.Max(0, MaxApplications - TotalApplications);
        public int RemainingStudentSlots => Math.Max(0, MaxStudents - CurrentStudents);
        public bool IsApplicationFull => TotalApplications >= MaxApplications;

    }
}