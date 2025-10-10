using System.ComponentModel.DataAnnotations;
using GraduationProjectManagement.Models;

namespace GraduationProjectManagement.DTOs
{
    public class LoginRequestDto
    {
        [Required]
        public string Username { get; set; } = string.Empty; // Can be email or school number
        
        [Required]
        public string Password { get; set; } = string.Empty;
        
        [Required]
        public UserRole Role { get; set; }
    }
    
    public class RegisterRequestDto
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
        [MinLength(6)]
        public string Password { get; set; } = string.Empty;
        
        [Required]
        public UserRole Role { get; set; }
        
        public string? StudentNumber { get; set; }
        public string? Department { get; set; }
        public string? Title { get; set; }
    }
    
    public class AuthResponseDto
    {
        public string Token { get; set; } = string.Empty;
        public UserDto User { get; set; } = null!;
    }
    
    public class UserDto
    {
        public int Id { get; set; }
        public string FirstName { get; set; } = string.Empty;
        public string LastName { get; set; } = string.Empty;
        public string Email { get; set; } = string.Empty;
        public UserRole Role { get; set; }
        public string? StudentNumber { get; set; }
        public string? SchoolNumber { get; set; }
        public string? TcIdentityNumber { get; set; }
        public string? Department { get; set; }
        public string? Title { get; set; }
    }
}