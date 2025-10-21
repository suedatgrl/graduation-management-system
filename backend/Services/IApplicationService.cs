using GraduationProjectManagement.DTOs;
using GraduationProjectManagement.Models;
namespace GraduationProjectManagement.Services
{
    public interface IApplicationService
    {
        Task<ApplicationDto?> ApplyToProjectAsync(CreateApplicationDto applicationDto, int studentId);
        Task<IEnumerable<ApplicationDto>> GetStudentApplicationsAsync(int studentId);
        Task<IEnumerable<ApplicationDto>> GetProjectApplicationsAsync(int projectId, int teacherId);
         Task<ProjectApplicationDto?> ReviewApplicationAsync(
            int applicationId, 
            int teacherId, 
            ApplicationStatus newStatus, 
            string? reviewNotes
        );
        Task<bool> WithdrawApplicationAsync(int applicationId, int studentId);
        Task<bool> CanStudentApplyAsync(int studentId);
    }
}