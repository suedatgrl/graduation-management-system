
using GraduationProjectManagement.Models;
using GraduationProjectManagement.DTOs;

namespace GraduationProjectManagement.Services
{
    public interface IAdminService
    {
        Task<IEnumerable<SystemSettings>> GetAllSettingsAsync();
        Task<SystemSettings?> GetSettingAsync(string key);
        Task<SystemSettings> UpdateSettingAsync(string key, string value, int updatedBy);
        Task<Dictionary<string, object>> GetDashboardStatsAsync();
        Task<UserDto> AddStudentAsync(CreateStudentDto studentDto);
        Task<UserDto> AddTeacherAsync(CreateTeacherDto teacherDto);
        Task<IEnumerable<UserDto>> BulkUploadUsersAsync(IFormFile excelFile, UserRole userType);
  
        Task<UserDto> UpdateUserAsync(int userId, UpdateUserDto dto);
        Task<IEnumerable<UserDto>> GetAllUsersAsync();
        

        Task<bool> DeleteUserAsync(int userId);


        Task<UserDto> ToggleUserStatusAsync(int userId);

        Task<IEnumerable<UserDto>> GetStudentsAsync();
        Task<IEnumerable<UserDto>> GetTeachersAsync();
        Task<IEnumerable<ProjectDto>> GetProjectsAsync();

        Task<ProjectDto> UpdateProjectAsAdminAsync(int projectId, UpdateProjectDto dto);
        Task<bool> DeleteProjectAsAdminAsync(int projectId);
        Task<bool> ReviewApplicationAsAdminAsync(int applicationId, ApplicationStatus status, string? reviewNotes);
    }
}