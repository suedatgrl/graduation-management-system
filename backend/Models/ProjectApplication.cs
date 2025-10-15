using System.ComponentModel.DataAnnotations;

namespace GraduationProjectManagement.Models
{
    public class ProjectApplication
    {
        public int Id { get; set; }
        
        [Required]
        public int StudentId { get; set; }
        
        [Required]
        public int ProjectId { get; set; }
        
        
        public ApplicationStatus Status { get; set; } = ApplicationStatus.Pending;
        
        public DateTime AppliedAt { get; set; } = DateTime.UtcNow;
        public DateTime? ReviewedAt { get; set; }
        
        // Navigation properties
        public virtual User Student { get; set; } = null!;
        public virtual Project Project { get; set; } = null!;
    }
    
    public enum ApplicationStatus
    {
        Pending = 1,
        Approved = 2,
        Rejected = 3,
    }
}