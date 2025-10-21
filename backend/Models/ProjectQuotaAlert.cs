using System.ComponentModel.DataAnnotations;

namespace GraduationProjectManagement.Models
{
    public class ProjectQuotaAlert
    {
        public int Id { get; set; }
        
        [Required]
        public int StudentId { get; set; }
        
        [Required]
        public int ProjectId { get; set; }
        
        public bool IsActive { get; set; } = true;
        public bool IsNotified { get; set; } = false;
        
        public DateTime CreatedAt { get; set; } = DateTime.UtcNow;
        public DateTime? NotifiedAt { get; set; }
        
        // Navigation properties
        public virtual User Student { get; set; } = null!;
        public virtual Project Project { get; set; } = null!;
    }
}