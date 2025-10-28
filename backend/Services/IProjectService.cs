using GraduationProjectManagement.DTOs;

namespace GraduationProjectManagement.Services
{
    public interface IProjectService
    {
        Task<IEnumerable<ProjectDto>> GetProjectsByCourseAsync(string? courseCode = null);
        Task<ProjectDto?> GetProjectByIdAsync(int id, int? userId = null);
        Task<IEnumerable<ProjectDto>> GetTeacherProjectsAsync(int teacherId);
        Task<ProjectDto> CreateProjectAsync(CreateProjectDto dto, int teacherId);
        Task<ProjectDto?> UpdateProjectAsync(int id, UpdateProjectDto dto, int teacherId);
        Task<bool> DeleteProjectAsync(int id, int teacherId);
        Task RefreshProjectCountersAsync(int projectId); // Yeni metod
         Task<IEnumerable<ProjectDto>> GetAllProjectsAsync( string courseCode);
         Task<bool> AssignStudentsToProjectAsync(int projectId, List<int> studentIds, int teacherId);
    }
}