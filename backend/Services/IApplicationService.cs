using GraduationProjectManagement.DTOs;

namespace GraduationProjectManagement.Services
{
    public interface IApplicationService
    {
        Task<ApplicationDto?> ApplyToProjectAsync(CreateApplicationDto applicationDto, int studentId);
        Task<IEnumerable<ApplicationDto>> GetStudentApplicationsAsync(int studentId);
        Task<IEnumerable<ApplicationDto>> GetProjectApplicationsAsync(int projectId, int teacherId);
        Task<ApplicationDto?> ReviewApplicationAsync(int applicationId, ReviewApplicationDto reviewDto, int teacherId);
        Task<bool> WithdrawApplicationAsync(int applicationId, int studentId);
        Task<bool> CanStudentApplyAsync(int studentId);
    }
}