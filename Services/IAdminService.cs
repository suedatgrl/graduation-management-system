
using GraduationProjectManagement.Models;

namespace GraduationProjectManagement.Services
{
    public interface IAdminService
    {
        Task<IEnumerable<SystemSettings>> GetAllSettingsAsync();
        Task<SystemSettings?> GetSettingAsync(string key);
        Task<SystemSettings> UpdateSettingAsync(string key, string value, int updatedBy);
        Task<Dictionary<string, object>> GetDashboardStatsAsync();
    }
}