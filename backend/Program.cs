using GraduationProjectManagement.Data;
using GraduationProjectManagement.Services;
using Microsoft.EntityFrameworkCore;
using Microsoft.AspNetCore.Authentication.JwtBearer;
using Microsoft.IdentityModel.Tokens;
using GraduationProjectManagement.Services.BackgroundServices;
using System.Text;
using Microsoft.OpenApi.Models;

var builder = WebApplication.CreateBuilder(args);


builder.Logging.ClearProviders();
builder.Logging.AddConsole();
builder.Logging.AddDebug();
builder.Logging.SetMinimumLevel(LogLevel.Information);
// Add services to the container.
builder.Services.AddControllers();
builder.Services.AddEndpointsApiExplorer();
builder.Services.AddSwaggerGen(c =>
{
    c.SwaggerDoc("v1", new OpenApiInfo { Title = "Graduation Project Management API", Version = "v1" });
    c.AddSecurityDefinition("Bearer", new OpenApiSecurityScheme
    {
        Description = "JWT Authorization header using the Bearer scheme",
        Name = "Authorization",
        In = ParameterLocation.Header,
        Type = SecuritySchemeType.ApiKey,
        Scheme = "Bearer"
    });
    c.AddSecurityRequirement(new OpenApiSecurityRequirement
    {
        {
            new OpenApiSecurityScheme
            {
                Reference = new OpenApiReference
                {
                    Type = ReferenceType.SecurityScheme,
                    Id = "Bearer"
                }
            },
            new string[] {}
        }
    });
});

// Database configuration

    var connectionString = builder.Configuration.GetConnectionString("DefaultConnection");
builder.Services.AddDbContext<AppDbContext>(options =>
    options.UseNpgsql(connectionString));


// JWT Authentication
var jwtSettings = builder.Configuration.GetSection("JwtSettings");
var secretKey = Encoding.ASCII.GetBytes(jwtSettings["SecretKey"]!);

builder.Services.AddAuthentication(options =>
{
    options.DefaultAuthenticateScheme = JwtBearerDefaults.AuthenticationScheme;
    options.DefaultChallengeScheme = JwtBearerDefaults.AuthenticationScheme;
})
.AddJwtBearer(options =>
{
    options.TokenValidationParameters = new TokenValidationParameters
    {
        ValidateIssuerSigningKey = true,
        IssuerSigningKey = new SymmetricSecurityKey(secretKey),
        ValidateIssuer = true,
        ValidIssuer = jwtSettings["Issuer"],
        ValidateAudience = true,
        ValidAudience = jwtSettings["Audience"],
        ValidateLifetime = true,
        ClockSkew = TimeSpan.Zero
    };
});

builder.Services.AddAuthorization();

// AutoMapper
builder.Services.AddAutoMapper(AppDomain.CurrentDomain.GetAssemblies());

// CORS
builder.Services.AddCors(options =>
{
    options.AddPolicy("AllowFrontend",
        policy => policy
            .WithOrigins("http://localhost:3001") // frontend adresiniz
            .AllowAnyHeader()
            .AllowAnyMethod()
            .AllowCredentials() // eğer cookie/credentials gönderiyorsanız
    );
});

// Service registrations
builder.Services.AddScoped<IAuthService, AuthService>();
builder.Services.AddScoped<IProjectService, ProjectService>();
builder.Services.AddScoped<IApplicationService, ApplicationService>();
builder.Services.AddScoped<IAdminService, AdminService>();
builder.Services.AddScoped<IEmailService, EmailService>();
builder.Services.AddScoped<ITeacherService, TeacherService>(); 
// YENİ SATIRLAR
builder.Services.AddScoped<IEmailService, EmailService>();
builder.Services.AddScoped<INotificationService, NotificationService>();
builder.Services.AddHostedService<NotificationBackgroundService>();  


var app = builder.Build();

using (var scope = app.Services.CreateScope())
{
    var services = scope.ServiceProvider;
    var logger = services.GetRequiredService<ILogger<Program>>();
    
    try
    {
        logger.LogInformation("⏳ Veritabanı bağlantısı kontrol ediliyor...");
        
        var context = services.GetRequiredService<AppDbContext>();
        
        // Database'in hazır olmasını bekle (max 30 saniye)
        int retryCount = 0;
        while (!context.Database.CanConnect() && retryCount < 30)
        {
            logger.LogWarning($"⚠️ Veritabanına bağlanılamadı, tekrar deneniyor... ({retryCount + 1}/30)");
            await Task.Delay(1000);
            retryCount++;
        }
        
        if (context.Database.CanConnect())
        {
            logger.LogInformation("✅ Veritabanına başarıyla bağlanıldı!");
            
            // Bekleyen migration'ları al
            var pendingMigrations = context.Database.GetPendingMigrations().ToList();
            
            if (pendingMigrations.Any())
            {
                logger.LogInformation($"⏳ {pendingMigrations.Count} migration çalıştırılıyor...");
                foreach (var migration in pendingMigrations)
                {
                    logger.LogInformation($"   - {migration}");
                }
                
                context.Database.Migrate();
                logger.LogInformation("✅ Migration'lar başarıyla tamamlandı!");
            }
            else
            {
                logger.LogInformation("✅ Tüm migration'lar zaten çalıştırılmış.");
            }
            
            // Tabloları listele
            var tables = context.Model.GetEntityTypes().Select(t => t.GetTableName()).ToList();
            logger.LogInformation($"📊 Veritabanında {tables.Count} tablo var:");
            foreach (var table in tables)
            {
                logger.LogInformation($"   - {table}");
            }
        }
        else
        {
            logger.LogError("❌ Veritabanına bağlanılamadı! 30 saniye içinde bağlantı kurulamadı.");
        }
    }
    catch (Exception ex)
    {
        logger.LogError(ex, "❌ Migration sırasında hata oluştu!");
        logger.LogError($"Hata detayı: {ex.Message}");
        if (ex.InnerException != null)
        {
            logger.LogError($"Inner Exception: {ex.InnerException.Message}");
        }
        // Uygulamayı durdurmadan devam et
    }
}



// Configure the HTTP request pipeline.
if (app.Environment.IsDevelopment())
{
    app.UseSwagger();
    app.UseSwaggerUI();
}

app.UseCors("AllowFrontend");
app.UseAuthentication();
app.UseAuthorization();
app.MapControllers();

app.Run();