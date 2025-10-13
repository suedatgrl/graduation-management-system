using GraduationProjectManagement.DTOs;
using GraduationProjectManagement.Models;

namespace GraduationProjectManagement.Services
{
    public interface IProjectService
    {
        Task<IEnumerable<ProjectDto>> GetAllProjectsAsync( string courseCode);
        Task<ProjectDto?> GetProjectByIdAsync(int id);
        Task<ProjectDto> CreateProjectAsync(CreateProjectDto createProjectDto, int teacherId);
        Task<ProjectDto?> UpdateProjectAsync(int id, UpdateProjectDto updateProjectDto, int teacherId);
        Task<bool> DeleteProjectAsync(int id, int teacherId);
        Task<IEnumerable<ProjectDto>> GetTeacherProjectsAsync(int teacherId);
    }
}