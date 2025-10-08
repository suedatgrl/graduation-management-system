using GraduationProjectManagement.DTOs;

namespace GraduationProjectManagement.Services
{
    public interface IAuthService
    {
        Task<AuthResponseDto?> LoginAsync(LoginRequestDto loginRequest);
        Task<AuthResponseDto?> RegisterAsync(RegisterRequestDto registerRequest);
        Task<UserDto?> GetUserByIdAsync(int userId);
    }
}