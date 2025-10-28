using System.ComponentModel.DataAnnotations;

namespace GraduationProjectManagement.DTOs
{
    public class UpdateUserDto
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

        // Öğrenci için
        public string? StudentNumber { get; set; }
        public string? CourseCode { get; set; }

        // Öğretmen için
        public int? TotalQuota { get; set; }

        // Opsiyonel
        [StringLength(11, MinimumLength = 11)]
        public string? SicilNumber { get; set; }
    }
}