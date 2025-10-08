using Microsoft.EntityFrameworkCore;
using GraduationProjectManagement.Data;
using GraduationProjectManagement.Models;

namespace GraduationProjectManagement.Services
{
    public class AdminService : IAdminService
    {
        private readonly AppDbContext _context;

        public AdminService(AppDbContext context)
        {
            _context = context;
        }

        public async Task<IEnumerable<SystemSettings>> GetAllSettingsAsync()
        {
            return await _context.SystemSettings
                .OrderBy(s => s.Key)
                .ToListAsync();
        }

        public async Task<SystemSettings?> GetSettingAsync(string key)
        {
            return await _context.SystemSettings
                .FirstOrDefaultAsync(s => s.Key == key);
        }

        public async Task<SystemSettings> UpdateSettingAsync(string key, string value, int updatedBy)
        {
            var setting = await _context.SystemSettings
                .FirstOrDefaultAsync(s => s.Key == key);

            if (setting == null)
            {
                setting = new SystemSettings
                {
                    Key = key,
                    Value = value,
                    UpdatedBy = updatedBy,
                    UpdatedAt = DateTime.UtcNow
                };
                _context.SystemSettings.Add(setting);
            }
            else
            {
                setting.Value = value;
                setting.UpdatedBy = updatedBy;
                setting.UpdatedAt = DateTime.UtcNow;
            }

            await _context.SaveChangesAsync();
            return setting;
        }

        public async Task<Dictionary<string, object>> GetDashboardStatsAsync()
        {
            var totalStudents = await _context.Users.CountAsync(u => u.Role == UserRole.Student);
            var totalTeachers = await _context.Users.CountAsync(u => u.Role == UserRole.Teacher);
            var totalProjects = await _context.Projects.CountAsync(p => p.IsActive);
            var totalApplications = await _context.ProjectApplications.CountAsync();
            var pendingApplications = await _context.ProjectApplications.CountAsync(pa => pa.Status == ApplicationStatus.Pending);
            var approvedApplications = await _context.ProjectApplications.CountAsync(pa => pa.Status == ApplicationStatus.Approved);

            return new Dictionary<string, object>
            {
                { "TotalStudents", totalStudents },
                { "TotalTeachers", totalTeachers },
                { "TotalProjects", totalProjects },
                { "TotalApplications", totalApplications },
                { "PendingApplications", pendingApplications },
                { "ApprovedApplications", approvedApplications }
            };
        }
    }
}