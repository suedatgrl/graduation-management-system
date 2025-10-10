using System.ComponentModel.DataAnnotations;
using GraduationProjectManagement.Models;

namespace GraduationProjectManagement.DTOs
{
    public class ProjectDto
    {
        public int Id { get; set; }
        public string Title { get; set; } = string.Empty;
        public string Description { get; set; } = string.Empty;
        public Department Department { get; set; }
        public int MaxStudents { get; set; }
        public int CurrentStudents { get; set; }
        public string? Requirements { get; set; }
        public string? Keywords { get; set; }
        public bool IsActive { get; set; }
        public UserDto Teacher { get; set; } = null!;
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
        public Department Department { get; set; }
        
        [Range(1, 10)]
        public int MaxStudents { get; set; } = 1;
        
        public string? Requirements { get; set; }
        public string? Keywords { get; set; }
    }
    
    public class UpdateProjectDto
    {
        [StringLength(200)]
        public string? Title { get; set; }
        
        public string? Description { get; set; }
        
        [Range(1, 10)]
        public int? MaxStudents { get; set; }
        
        public string? Requirements { get; set; }
        public string? Keywords { get; set; }
        public bool? IsActive { get; set; }
    }
}