using GraduationProjectManagement.DTOs;

namespace GraduationProjectManagement.Services
{
    public interface ITeacherService
    {
        Task<IEnumerable<TeacherWithQuotaDto>> GetAllTeachersWithQuotaAsync();
        Task<TeacherWithQuotaDto?> GetTeacherWithProjectsAsync(int teacherId);
    }
}