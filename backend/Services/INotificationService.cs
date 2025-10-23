using GraduationProjectManagement.Models;
using GraduationProjectManagement.DTOs;

namespace GraduationProjectManagement.Services
{
    public interface INotificationService
    {
        Task<Notification> CreateNotificationAsync(int userId, NotificationType type, string title, string message, int? projectId = null, int? applicationId = null);
        Task<IEnumerable<NotificationDto>> GetUserNotificationsAsync(int userId);
        Task<int> GetUnreadCountAsync(int userId);
        Task<bool> MarkAsReadAsync(int notificationId, int userId);
        Task<bool> MarkAllAsReadAsync(int userId);
        Task<bool> DeleteNotificationAsync(int notificationId, int userId);
        
        // Quota Alert methods
        Task<bool> CreateQuotaAlertAsync(int studentId, int projectId);
        Task<bool> RemoveQuotaAlertAsync(int studentId, int projectId);
        Task CheckAndNotifyQuotaAlertsAsync();
        Task SendReviewDeadlineWarningsAsync(); 
        
        // Deadline Warning methods
        Task SendDeadlineWarningsAsync();
    }
}