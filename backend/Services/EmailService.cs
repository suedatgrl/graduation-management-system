using System.Net;
using System.Net.Mail;
using Microsoft.Extensions.Configuration;

namespace GraduationProjectManagement.Services
{
    public class EmailService : IEmailService
    {
        private readonly IConfiguration _configuration;

        public EmailService(IConfiguration configuration)
        {
            _configuration = configuration;
        }

        public async Task SendPasswordResetEmailAsync(string email, string resetToken)
        {
            var smtpSettings = _configuration.GetSection("SmtpSettings");
            
            // For development, just log the reset token
            // In production, this would send an actual email
            Console.WriteLine($"Password reset requested for {email}");
            Console.WriteLine($"Reset token: {resetToken}");
            Console.WriteLine($"Reset link would be: /reset-password?token={resetToken}&email={email}");
            
            // TODO: Implement actual email sending in production
            // var smtpClient = new SmtpClient(smtpSettings["Host"])
            // {
            //     Port = int.Parse(smtpSettings["Port"]),
            //     Credentials = new NetworkCredential(smtpSettings["Username"], smtpSettings["Password"]),
            //     EnableSsl = true,
            // };
            
            // var mailMessage = new MailMessage
            // {
            //     From = new MailAddress(smtpSettings["FromEmail"]),
            //     Subject = "Password Reset Request",
            //     Body = $"Please use this token to reset your password: {resetToken}",
            //     IsBodyHtml = false,
            // };
            // mailMessage.To.Add(email);
            
            // await smtpClient.SendMailAsync(mailMessage);
            
            await Task.CompletedTask;
        }
    }
}
