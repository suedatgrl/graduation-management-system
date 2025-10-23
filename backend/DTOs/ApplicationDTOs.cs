using System.ComponentModel.DataAnnotations;
using GraduationProjectManagement.Models;

namespace GraduationProjectManagement.DTOs
{
    public class ApplicationDto
    {
        public int Id { get; set; }
        public int ProjectId { get; set; }
        public string ProjectTitle { get; set; } = string.Empty;
        public UserDto Student { get; set; } = null!;
        public string Status { get; set; } = string.Empty;
        public DateTime AppliedAt { get; set; }
        public DateTime? ReviewedAt { get; set; }

        public string? ReviewNotes { get; set; }
        public string? StudentNote { get; set; } 
    }
    
    public class CreateApplicationDto
    {
        [Required]
        public int ProjectId { get; set; }

        public string? StudentNote { get; set; }
        

    }
    
  public class ReviewApplicationDto
    {
        [Required]
        public ApplicationStatus Status { get; set; }
        
        public string? ReviewNotes { get; set; }
    }
}