using System.Net;
using System.Net.Mail;
using Microsoft.Extensions.Configuration;
using GraduationProjectManagement.Models;

namespace GraduationProjectManagement.Services
{
    public class EmailService : IEmailService
    {
        private readonly IConfiguration _configuration;
        private readonly string _smtpServer;
        private readonly int _smtpPort;
        private readonly string _smtpUsername;
        private readonly string _smtpPassword;
        private readonly string _fromEmail;

        public EmailService(IConfiguration configuration)
        {
            _configuration = configuration;
            _smtpServer = _configuration["Email:SmtpServer"] ?? "smtp.gmail.com";
            _smtpPort = int.Parse(_configuration["Email:SmtpPort"] ?? "587");
            _smtpUsername = _configuration["Email:Username"] ?? "";
            _smtpPassword = _configuration["Email:Password"] ?? "";
            _fromEmail = _configuration["Email:FromEmail"] ?? "noreply@university.edu";
        }

         public async Task SendPasswordResetEmailAsync(string email, string resetToken)
        {
            var smtpSettings = _configuration.GetSection("SmtpSettings");
            
      
            Console.WriteLine($"Password reset requested for {email}");
            Console.WriteLine($"Reset token: {resetToken}");
            Console.WriteLine($"Reset link would be: /reset-password?token={resetToken}&email={email}");
            
     
            var smtpClient = new SmtpClient(smtpSettings["Host"])
             {
                Port = int.Parse(smtpSettings["Port"]),
                Credentials = new NetworkCredential(smtpSettings["Username"], smtpSettings["Password"]),
                EnableSsl = true,
             };
            
             var fromAddress = smtpSettings["FromEmail"];
             if (string.IsNullOrWhiteSpace(fromAddress))
             {
                 fromAddress = _fromEmail;
             }

             var mailMessage = new MailMessage
             {
                 From = new MailAddress(fromAddress),
                 Subject = "Password Reset Request",
                 Body = $"Please use this token to reset your password: {resetToken}",
                 IsBodyHtml = false,
             };
             mailMessage.To.Add(email);
            
             await smtpClient.SendMailAsync(mailMessage);
            
            await Task.CompletedTask;
        }

        public async Task SendEmailAsync(string to, string subject, string body)
        {
            try
            {
                using var client = new SmtpClient(_smtpServer, _smtpPort)
                {
                    Credentials = new NetworkCredential(_smtpUsername, _smtpPassword),
                    EnableSsl = true
                };

                var mailMessage = new MailMessage
                {
                    From = new MailAddress(_fromEmail, "Bitirme Projesi Yönetim Sistemi"),
                    Subject = subject,
                    Body = body,
                    IsBodyHtml = true
                };
                
                mailMessage.To.Add(to);

                await client.SendMailAsync(mailMessage);
            }
            catch (Exception ex)
            {
                Console.WriteLine($"Email gönderme hatası: {ex.Message}");
                // Log the error but don't throw - notification should still work
            }
        }

        public async Task SendNotificationEmailAsync(Notification notification)
        {
            var subject = $"🔔 {notification.Title}";
            var body = $@"
                <html>
                <body style='font-family: Arial, sans-serif; padding: 20px;'>
                    <div style='max-width: 600px; margin: 0 auto; border: 1px solid #ddd; border-radius: 8px; overflow: hidden;'>
                        <div style='background: linear-gradient(135deg, #667eea 0%, #764ba2 100%); color: white; padding: 20px; text-align: center;'>
                            <h2 style='margin: 0;'>🔔 Yeni Bildirim</h2>
                        </div>
                        <div style='padding: 30px;'>
                            <h3 style='color: #333; margin-top: 0;'>{notification.Title}</h3>
                            <p style='color: #666; line-height: 1.6;'>{notification.Message}</p>
                            <div style='margin-top: 30px; padding: 15px; background: #f8f9fa; border-radius: 6px;'>
                                <p style='margin: 0; color: #666; font-size: 14px;'>
                                    <strong>Tarih:</strong> {notification.CreatedAt.ToString("dd.MM.yyyy HH:mm")}
                                </p>
                            </div>
                            <div style='margin-top: 30px; text-align: center;'>
                                <a href='http://localhost:3000/dashboard' 
                                   style='display: inline-block; background: #667eea; color: white; padding: 12px 30px; text-decoration: none; border-radius: 6px;'>
                                    Sisteme Git
                                </a>
                            </div>
                        </div>
                        <div style='background: #f8f9fa; padding: 15px; text-align: center; font-size: 12px; color: #999;'>
                            <p style='margin: 0;'>Bu otomatik bir mesajdır, lütfen yanıtlamayın.</p>
                        </div>
                    </div>
                </body>
                </html>
            ";

            await SendEmailAsync(notification.User.Email, subject, body);
        }

        public async Task SendQuotaAlertEmailAsync(User student, Project project)
        {
            var subject = "🎉 Kontenjan Açıldı!";
            var body = $@"
                <html>
                <body style='font-family: Arial, sans-serif; padding: 20px;'>
                    <div style='max-width: 600px; margin: 0 auto; border: 1px solid #ddd; border-radius: 8px; overflow: hidden;'>
                        <div style='background: linear-gradient(135deg, #11998e 0%, #38ef7d 100%); color: white; padding: 20px; text-align: center;'>
                            <h2 style='margin: 0;'>🎉 Harika Haber!</h2>
                        </div>
                        <div style='padding: 30px;'>
                            <h3 style='color: #333;'>Takip Ettiğiniz Projede Kontenjan Açıldı!</h3>
                            <div style='background: #f0fdf4; border-left: 4px solid #10b981; padding: 15px; margin: 20px 0;'>
                                <p style='margin: 0; font-size: 18px; font-weight: bold; color: #059669;'>{project.Title}</p>
                                <p style='margin: 10px 0 0 0; color: #666;'>Öğretim Üyesi: {project.Teacher.FirstName} {project.Teacher.LastName}</p>
                            </div>
                            <p style='color: #666; line-height: 1.6;'>
                                Takip ettiğiniz projede kontenjan açıldı! Hemen başvurabilirsiniz.
                            </p>
                            <div style='margin-top: 30px; text-align: center;'>
                                <a href='http://localhost:3000/dashboard' 
                                   style='display: inline-block; background: #10b981; color: white; padding: 12px 30px; text-decoration: none; border-radius: 6px;'>
                                    Hemen Başvur
                                </a>
                            </div>
                        </div>
                    </div>
                </body>
                </html>
            ";

            await SendEmailAsync(student.Email, subject, body);
        }

        public async Task SendDeadlineWarningEmailAsync(User student, int daysLeft)
        {
            var subject = $"⚠️ Son {daysLeft} Gün - Proje Seçimi";
            var body = $@"
                <html>
                <body style='font-family: Arial, sans-serif; padding: 20px;'>
                    <div style='max-width: 600px; margin: 0 auto; border: 1px solid #ddd; border-radius: 8px; overflow: hidden;'>
                        <div style='background: linear-gradient(135deg, #f093fb 0%, #f5576c 100%); color: white; padding: 20px; text-align: center;'>
                            <h2 style='margin: 0;'>⚠️ Proje Seçimi İçin Son {daysLeft} Gün!</h2>
                        </div>
                        <div style='padding: 30px;'>
                            <p style='color: #666; line-height: 1.6; font-size: 16px;'>
                                Merhaba {student.FirstName},
                            </p>
                            <p style='color: #666; line-height: 1.6;'>
                                Henüz bir bitirme projesi seçmediniz. Proje seçimi için geriye sadece <strong style='color: #dc2626;'>{daysLeft} gün</strong> kaldı!
                            </p>
                            <div style='background: #fef2f2; border-left: 4px solid #dc2626; padding: 15px; margin: 20px 0;'>
                                <p style='margin: 0; color: #991b1b;'>
                                    <strong>Önemli:</strong> Son başvuru tarihini kaçırmamak için en kısa sürede bir proje seçmenizi öneririz.
                                </p>
                            </div>
                            <div style='margin-top: 30px; text-align: center;'>
                                <a href='http://localhost:3000/dashboard' 
                                   style='display: inline-block; background: #dc2626; color: white; padding: 12px 30px; text-decoration: none; border-radius: 6px;'>
                                    Projeleri İncele
                                </a>
                            </div>
                        </div>
                    </div>
                </body>
                </html>
            ";

            await SendEmailAsync(student.Email, subject, body);
        }

        public async Task SendReviewDeadlineWarningEmailAsync(User teacher, int daysRemaining, int pendingCount)
{
    var subject = daysRemaining == 0 
        ? "🚨 SON GÜN - Başvuru Değerlendirme" 
        : $"⏰ Son {daysRemaining} Gün - Başvuru Değerlendirme";

    var message = daysRemaining == 0
        ? $"Sayın {teacher.FirstName} {teacher.LastName},\n\n{pendingCount} bekleyen başvurunuz var ve bugün değerlendirme için son gün!\n\nLütfen acilen başvuruları değerlendirin."
        : $"Sayın {teacher.FirstName} {teacher.LastName},\n\n{pendingCount} bekleyen başvurunuz var.\n\nDeğerlendirme için {daysRemaining} gün kaldı.";

    await SendEmailAsync(teacher.Email, subject, message);
}
    }
}