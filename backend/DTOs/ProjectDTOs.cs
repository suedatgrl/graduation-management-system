using System.ComponentModel.DataAnnotations;
using GraduationProjectManagement.Models;

namespace GraduationProjectManagement.DTOs
{
    public class ProjectDto
    {
        public int Id { get; set; }
        public string Title { get; set; } = string.Empty;
        public string Description { get; set; } = string.Empty;
         public string Details{ get; set; } = string.Empty;
        public string CourseCode { get; set; } = string.Empty;
        public int MaxStudents { get; set; }
        public int CurrentStudents { get; set; } // Onaylanan öğrenci sayısı
        public int TotalApplications { get; set; } // Toplam başvuru sayısı
        public int MaxApplications { get; set; } // Max başvuru sayısı (MaxStudents + 2)
        public int RemainingApplicationSlots { get; set; } // Kalan başvuru kontenjanı
        public int RemainingStudentSlots { get; set; } // Kalan öğrenci kontenjanı
        public bool IsApplicationFull { get; set; } // Başvuru kontenjanı doldu mu
        public UserDto Teacher { get; set; } = null!;
        public bool IsActive { get; set; }
        public DateTime CreatedAt { get; set; }
    }

    public class CreateProjectDto
    {
        [Required]
        [StringLength(200)]
        public string Title { get; set; } = string.Empty;

        [Required]
        public string Description { get; set; } = string.Empty;
        
        [Required]
        public string Details { get; set; } = string.Empty;
        
        [Required]
        public string CourseCode { get; set; } = string.Empty;
        
        [Required]
        [Range(1, 10)]
        public int MaxStudents { get; set; } = 1;
    }

    public class UpdateProjectDto
    {
        [Required]
        [StringLength(200)]
        public string Title { get; set; } = string.Empty;

        [Required]
        public string Description { get; set; } = string.Empty;
        
        [Required]
        public string Details { get; set; } = string.Empty;
        
        [Required]
        [Range(1, 10)]
        public int MaxStudents { get; set; } = 1;
        
        public bool IsActive { get; set; } = true;
    }
}