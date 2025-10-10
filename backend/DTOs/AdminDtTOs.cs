using System.ComponentModel.DataAnnotations;
using GraduationProjectManagement.Models;

namespace GraduationProjectManagement.DTOs
{
    public class CreateStudentDto
    {
        [Required]
        [StringLength(100)]
        public string FirstName { get; set; } = string.Empty;
        
        [Required]
        [StringLength(100)]
        public string LastName { get; set; } = string.Empty;
        
        [Required]
        [EmailAddress]
        public string Email { get; set; } = string.Empty;
        
        [Required]
        [StringLength(11, MinimumLength = 11)]
        [RegularExpression(@"^\d{11}$", ErrorMessage = "TC Identity Number must be exactly 11 digits")]
        public string TcIdentityNumber { get; set; } = string.Empty;
        
        [Required]
        public string SchoolNumber { get; set; } = string.Empty;
        
        public string? Department { get; set; }
    }
    
    public class CreateTeacherDto
    {
        [Required]
        [StringLength(100)]
        public string FirstName { get; set; } = string.Empty;
        
        [Required]
        [StringLength(100)]
        public string LastName { get; set; } = string.Empty;
        
        [Required]
        [EmailAddress]
        public string Email { get; set; } = string.Empty;
        
        [Required]
        [StringLength(11, MinimumLength = 11)]
        [RegularExpression(@"^\d{11}$", ErrorMessage = "TC Identity Number must be exactly 11 digits")]
        public string TcIdentityNumber { get; set; } = string.Empty;
        
        public string? Department { get; set; }
        
        public string? Title { get; set; }
    }
    
    public class BulkUserUploadDto
    {
        [Required]
        public IFormFile ExcelFile { get; set; } = null!;
        
        [Required]
        public UserRole UserType { get; set; }
    }
}