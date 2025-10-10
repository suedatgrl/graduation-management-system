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
        public Department Department { get; set; }
        
        [Required]
        public int TeacherId { get; set; }
        
        [Range(1, 10)]
        public int MaxStudents { get; set; } = 1;
        
        public int CurrentStudents { get; set; } = 0;
        
        public string? Requirements { get; set; }
        public string? Keywords { get; set; }
        
        public DateTime CreatedAt { get; set; } = DateTime.UtcNow;
        public bool IsActive { get; set; } = true;
        
        // Navigation properties
        public virtual User Teacher { get; set; } = null!;
        public virtual ICollection<ProjectApplication> Applications { get; set; } = new List<ProjectApplication>();
    }
    
    public enum Department
    {
        Turkish = 1,
        English = 2
    }
}