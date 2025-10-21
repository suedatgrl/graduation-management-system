using Microsoft.AspNetCore.Mvc;
using Microsoft.AspNetCore.Authorization;
using System.Security.Claims;
using GraduationProjectManagement.Services;
using GraduationProjectManagement.Data;
using Microsoft.EntityFrameworkCore;

namespace GraduationProjectManagement.Controllers
{
    [Authorize]
    [ApiController]
    [Route("api/[controller]")]
    public class NotificationsController : ControllerBase
    {
        private readonly AppDbContext _context; 
        private readonly INotificationService _notificationService;

        public NotificationsController(INotificationService notificationService)
        {
            _notificationService = notificationService;
        }

        // GET: api/notifications
        [HttpGet]
        public async Task<IActionResult> GetMyNotifications()
        {
            var userId = int.Parse(User.FindFirstValue(ClaimTypes.NameIdentifier)!);
            var notifications = await _notificationService.GetUserNotificationsAsync(userId);
            return Ok(notifications);
        }

        // GET: api/notifications/unread-count
        [HttpGet("unread-count")]
        public async Task<IActionResult> GetUnreadCount()
        {
            var userId = int.Parse(User.FindFirstValue(ClaimTypes.NameIdentifier)!);
            var count = await _notificationService.GetUnreadCountAsync(userId);
            return Ok(new { count });
        }

        // PUT: api/notifications/{id}/read
        [HttpPut("{id}/read")]
        public async Task<IActionResult> MarkAsRead(int id)
        {
            var userId = int.Parse(User.FindFirstValue(ClaimTypes.NameIdentifier)!);
            var result = await _notificationService.MarkAsReadAsync(id, userId);
            
            if (!result)
                return NotFound(new { message = "Bildirim bulunamadı." });

            return Ok(new { message = "Bildirim okundu olarak işaretlendi." });
        }

        // PUT: api/notifications/read-all
        [HttpPut("read-all")]
        public async Task<IActionResult> MarkAllAsRead()
        {
            var userId = int.Parse(User.FindFirstValue(ClaimTypes.NameIdentifier)!);
            await _notificationService.MarkAllAsReadAsync(userId);
            return Ok(new { message = "Tüm bildirimler okundu olarak işaretlendi." });
        }

        // DELETE: api/notifications/{id}
        [HttpDelete("{id}")]
        public async Task<IActionResult> DeleteNotification(int id)
        {
            var userId = int.Parse(User.FindFirstValue(ClaimTypes.NameIdentifier)!);
            var result = await _notificationService.DeleteNotificationAsync(id, userId);
            
            if (!result)
                return NotFound(new { message = "Bildirim bulunamadı." });

            return Ok(new { message = "Bildirim silindi." });
        }

        // POST: api/notifications/quota-alert/{projectId}
        [HttpPost("quota-alert/{projectId}")]
        public async Task<IActionResult> CreateQuotaAlert(int projectId)
        {
            var userId = int.Parse(User.FindFirstValue(ClaimTypes.NameIdentifier)!);
            var result = await _notificationService.CreateQuotaAlertAsync(userId, projectId);
            
            if (!result)
                return BadRequest(new { message = "Bu proje için zaten alert oluşturdunuz." });

            return Ok(new { message = "Kontenjan açıldığında bildirim alacaksınız." });
        }

        // DELETE: api/notifications/quota-alert/{projectId}
        [HttpDelete("quota-alert/{projectId}")]
        public async Task<IActionResult> RemoveQuotaAlert(int projectId)
        {
            var userId = int.Parse(User.FindFirstValue(ClaimTypes.NameIdentifier)!);
            var result = await _notificationService.RemoveQuotaAlertAsync(userId, projectId);

            if (!result)
                return NotFound(new { message = "Alert bulunamadı." });

            return Ok(new { message = "Alert kaldırıldı." });
        }
        

      
        [HttpPost("test/deadline-warnings")]
        public async Task<IActionResult> TestDeadlineWarnings()
        {
            try
            {
                Console.WriteLine("🧪 Manuel deadline warning testi başladı...");
                await _notificationService.SendDeadlineWarningsAsync();
                return Ok(new 
                { 
                    message = "Deadline warnings başarıyla kontrol edildi ve gönderildi.",
                    timestamp = DateTime.UtcNow 
                });
            }
            catch (Exception ex)
            {
                Console.WriteLine($"❌ Hata: {ex.Message}");
                return StatusCode(500, new 
                { 
                    message = "Hata oluştu", 
                    error = ex.Message,
                    stackTrace = ex.StackTrace
                });
            }
        }

        // POST: api/notifications/test/quota-alerts
        [Authorize(Roles = "Admin")]
        [HttpPost("test/quota-alerts")]
        public async Task<IActionResult> TestQuotaAlerts()
        {
            try
            {
                Console.WriteLine("🧪 Manuel quota alert testi başladı...");
                await _notificationService.CheckAndNotifyQuotaAlertsAsync();
                return Ok(new
                {
                    message = "Quota alerts başarıyla kontrol edildi.",
                    timestamp = DateTime.UtcNow
                });
            }
            catch (Exception ex)
            {
                Console.WriteLine($"❌ Hata: {ex.Message}");
                return StatusCode(500, new
                {
                    message = "Hata oluştu",
                    error = ex.Message
                });
            }
        }

        // GET: api/notifications/test/deadline-info
        [Authorize]
        [HttpGet("test/deadline-info")]
        public async Task<IActionResult> GetDeadlineInfo()
        {
            try
            {
                var deadlineSetting = await _context.SystemSettings
                    .FirstOrDefaultAsync(s => s.Key == "ApplicationDeadline");

                if (deadlineSetting == null)
                {
                    return Ok(new { message = "Deadline ayarlanmamış" });
                }

                DateTime.TryParse(deadlineSetting.Value, out var deadline);
                var now = DateTime.UtcNow;
                var daysUntilDeadline = (deadline - now).Days;

                return Ok(new
                {
                    deadline = deadline,
                    deadlineFormatted = deadline.ToString("dd.MM.yyyy HH:mm"),
                    now = now,
                    nowFormatted = now.ToString("dd.MM.yyyy HH:mm"),
                    daysUntilDeadline = daysUntilDeadline,
                    isInWarningRange = daysUntilDeadline >= 0 && daysUntilDeadline <= 7,
                    shouldSendWarning = daysUntilDeadline >= 0 && daysUntilDeadline <= 7
                });
            }
            catch (Exception ex)
            {
                return StatusCode(500, new { message = ex.Message });
            }
        }

        [Authorize]  // Herkes tetikleyebilir
[HttpPost("trigger-deadline-check")]
public async Task<IActionResult> TriggerDeadlineCheck()
{
    try
    {
        var userId = int.Parse(User.FindFirstValue(ClaimTypes.NameIdentifier)!);
        
        Console.WriteLine($"🔔 Manuel deadline check tetiklendi - User: {userId}");
        
        // Deadline kontrolü yap
        await _notificationService.SendDeadlineWarningsAsync();
        
        // Bildirimleri yeniden çek
        var notifications = await _notificationService.GetUserNotificationsAsync(userId);
        var unreadCount = await _notificationService.GetUnreadCountAsync(userId);
        
        return Ok(new 
        { 
            message = "Deadline kontrolü tamamlandı",
            timestamp = DateTime.UtcNow,
            unreadCount = unreadCount,
            latestNotifications = notifications.Take(5)
        });
    }
    catch (Exception ex)
    {
        Console.WriteLine($"❌ Hata: {ex.Message}");
        return StatusCode(500, new { message = ex.Message });
    }
}

        
        
    }
}
    