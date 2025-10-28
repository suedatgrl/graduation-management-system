using System.ComponentModel.DataAnnotations;

namespace GraduationProjectManagement.Models
{
    public class User
    {
        public int Id { get; set; }
        
        [Required]
        [StringLength(100)]
        public string FirstName { get; set; } = string.Empty;
        
        [Required]
        [StringLength(100)]
        public string LastName { get; set; } = string.Empty;
        
        [Required]
        [StringLength(255)]
        public string Email { get; set; } = string.Empty;
        
        [Required]
        public string PasswordHash { get; set; } = string.Empty;
        
        [Required]
        public UserRole Role { get; set; }
        
        // Student fields
        public string? StudentNumber { get; set; }

        public string? CourseCode { get; set; } // BLM for Turkish, COM for English
        
        // Common field for both students and teachers
   
        public string? SicilNumber {get; set;} //öğretmen için sicil no

         public int? TotalQuota { get; set; } //öğretmen için toplam kontenjan
        
        // Password reset fields
        public string? PasswordResetToken { get; set; }
        public DateTime? PasswordResetTokenExpiry { get; set; }
        
        public DateTime CreatedAt { get; set; } = DateTime.UtcNow;
        public bool IsActive { get; set; } = true;

     
        public bool MustChangePassword { get; set; } = false;
        public DateTime? LastPasswordChangeDate { get; set; }
        
        // Navigation properties
         public virtual ICollection<Project> Projects { get; set; } = new List<Project>();
        public virtual ICollection<ProjectApplication> Applications { get; set; } = new List<ProjectApplication>();
    }
    
    public enum UserRole
    {
        Student = 1,
        Teacher = 2,
        Admin = 3
    }
}