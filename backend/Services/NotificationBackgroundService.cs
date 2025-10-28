using Microsoft.Extensions.DependencyInjection;
using Microsoft.Extensions.Hosting;
using Microsoft.Extensions.Logging;

namespace GraduationProjectManagement.Services.BackgroundServices
{
    public class NotificationBackgroundService : BackgroundService
    {
        private readonly ILogger<NotificationBackgroundService> _logger;
        private readonly IServiceProvider _serviceProvider;

        public NotificationBackgroundService(
            ILogger<NotificationBackgroundService> logger,
            IServiceProvider serviceProvider)
        {
            _logger = logger;
            _serviceProvider = serviceProvider;
        }

        protected override async Task ExecuteAsync(CancellationToken stoppingToken)
        {
            _logger.LogInformation("🚀 Notification Background Service BAŞLATILDI!");
            Console.WriteLine("🚀 Notification Background Service BAŞLATILDI!");

            // Eğer şu an saat 09:00 ise bildirimleri hemen gönder
            var now = DateTime.Now;
            if (now.Hour == 9 && now.Minute == 0)
            {
                using (var scope = _serviceProvider.CreateScope())
                {
                    var notificationService = scope.ServiceProvider
                        .GetRequiredService<INotificationService>();

                    Console.WriteLine("🔔 09:00 - İlk bildirimler gönderiliyor...");
                    await notificationService.SendDeadlineWarningsAsync();
                    await notificationService.SendReviewDeadlineWarningsAsync();
                }
            }

            // İlk çalışmayı 10 saniye sonra yap
            await Task.Delay(TimeSpan.FromSeconds(10), stoppingToken);

            while (!stoppingToken.IsCancellationRequested)
            {
                try
                {
                    _logger.LogInformation("⏰ Background Service çalışıyor... {Time}", DateTime.UtcNow);
                    Console.WriteLine($"⏰ Background Service çalışıyor: {DateTime.UtcNow:yyyy-MM-dd HH:mm:ss}");
                    
                    using (var scope = _serviceProvider.CreateScope())
                    {
                        var notificationService = scope.ServiceProvider
                            .GetRequiredService<INotificationService>();

                        Console.WriteLine("🔍 Kontenjan alert'leri kontrol ediliyor...");
                        await notificationService.CheckAndNotifyQuotaAlertsAsync();

                        Console.WriteLine("📅 Öğrenci deadline uyarıları kontrol ediliyor...");
                        await notificationService.SendDeadlineWarningsAsync();
                        
                        Console.WriteLine("👨‍🏫 Öğretmen değerlendirme deadline uyarıları kontrol ediliyor...");
                        await notificationService.SendReviewDeadlineWarningsAsync();
                        
                        Console.WriteLine("✅ Background Service döngüsü tamamlandı!");
                    }
                }
                catch (Exception ex)
                {
                    _logger.LogError(ex, "❌ Background Service hatası: {Message}", ex.Message);
                    Console.WriteLine($"❌ Background Service hatası: {ex.Message}");
                }

                // Test için 1 dakika (production'da 1 saat yapabilirsiniz)
                Console.WriteLine("⏳ 1 dakika bekleniyor...");
                await Task.Delay(TimeSpan.FromMinutes(1), stoppingToken);
                
                // Production için:
                // await Task.Delay(TimeSpan.FromHours(1), stoppingToken);
            }

            _logger.LogInformation("🛑 Notification Background Service durduruluyor.");
            Console.WriteLine("🛑 Notification Background Service durduruluyor.");
        }
    }
}