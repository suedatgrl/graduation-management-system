using GraduationProjectManagement.Models;

namespace GraduationProjectManagement.Services
{
    public interface IEmailService
    {
        Task SendPasswordResetEmailAsync(string email, string resetToken);
        Task SendEmailAsync(string to, string subject, string body);
        Task SendNotificationEmailAsync(Notification notification);
        Task SendQuotaAlertEmailAsync(User student, Project project);
        Task SendDeadlineWarningEmailAsync(User student, int daysLeft);
        Task SendReviewDeadlineWarningEmailAsync(User teacher, int daysRemaining, int pendingCount);
    }
}