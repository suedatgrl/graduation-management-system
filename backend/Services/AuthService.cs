using System.IdentityModel.Tokens.Jwt;
using System.Security.Claims;
using System.Text;
using AutoMapper;
using GraduationProjectManagement.Data;
using GraduationProjectManagement.DTOs;
using GraduationProjectManagement.Models;
using Microsoft.EntityFrameworkCore;
using Microsoft.IdentityModel.Tokens;

namespace GraduationProjectManagement.Services
{
    public class AuthService : IAuthService
    {
        private readonly AppDbContext _context;
        private readonly IConfiguration _configuration;
        private readonly IMapper _mapper;
        private readonly IEmailService _emailService;

        public AuthService(AppDbContext context, IConfiguration configuration, IMapper mapper, IEmailService emailService)
        {
            _context = context;
            _configuration = configuration;
            _mapper = mapper;
            _emailService = emailService;
        }

        public async Task<AuthResponseDto?> LoginAsync(LoginRequestDto loginRequest)
        {
            User? user = null;

            // E-mail formatında mı kontrol et
            if (loginRequest.Username.Contains('@'))
            {
                // E-mail ile giriş - veritabanından kullanıcıyı bul
                user = await _context.Users
                    .FirstOrDefaultAsync(u => u.Email == loginRequest.Username && u.IsActive);
            }
            else if (System.Text.RegularExpressions.Regex.IsMatch(loginRequest.Username, @"^\d+$"))
            {
                // Sadece rakamlardan oluşuyorsa öğrenci numarası olarak kabul et
                // Öğrenci numarası ile giriş - hem SchoolNumber hem StudentNumber alanlarını kontrol et
                user = await _context.Users
                    .FirstOrDefaultAsync(u => (
                                             u.StudentNumber == loginRequest.Username) && 
                                            u.IsActive);

                // Eğer kullanıcı bulunduysa ve rolü öğrenci değilse hata ver
                if (user != null && user.Role != UserRole.Student)
                {
                    return null; // Öğrenci numarası ile giriş yapan kullanıcı öğrenci rolünde olmalı
                }
            }
            else
            {
                // Ne e-mail ne de rakam formatında - geçersiz giriş
                return null;
            }

            // Kullanıcı bulunamadı
            if (user == null)
            {
                return null;
            }

            // Şifre kontrolü
            if (!BCrypt.Net.BCrypt.Verify(loginRequest.Password, user.PasswordHash))
            {
                return null;
            }

            // Kullanıcı aktif kontrolü (ekstra güvenlik)
            if (!user.IsActive)
            {
                return null;
            }

            var token = GenerateJwtToken(user);
            var userDto = _mapper.Map<UserDto>(user);

            return new AuthResponseDto
            {
                Token = token,
                User = userDto
            };
        }

        public async Task<UserDto?> GetUserByIdAsync(int userId)
        {
            var user = await _context.Users.FindAsync(userId);
            if (user == null)
                return null;

            return _mapper.Map<UserDto>(user);
        }

        public async Task<bool> ForgotPasswordAsync(ForgotPasswordDto forgotPasswordDto)
        {
            var user = await _context.Users
                .FirstOrDefaultAsync(u => u.Email == forgotPasswordDto.Email && u.IsActive);
            
            if (user == null)
            {
                // Güvenlik için her zaman true döndür (e-mail'in var olup olmadığını açığa çıkarma)
                return true;
            }

            // Reset token oluştur
            var resetToken = Guid.NewGuid().ToString();
            user.PasswordResetToken = resetToken;
            user.PasswordResetTokenExpiry = DateTime.UtcNow.AddHours(1);

            await _context.SaveChangesAsync();

            // E-mail gönder
            await _emailService.SendPasswordResetEmailAsync(user.Email, resetToken);

            return true;
        }

        public async Task<bool> ResetPasswordAsync(ResetPasswordDto resetPasswordDto)
        {
            var user = await _context.Users.FirstOrDefaultAsync(u => 
                u.Email == resetPasswordDto.Email &&
                u.PasswordResetToken == resetPasswordDto.Token &&
                u.PasswordResetTokenExpiry > DateTime.UtcNow &&
                u.IsActive);

            if (user == null)
                return false;

            user.PasswordHash = BCrypt.Net.BCrypt.HashPassword(resetPasswordDto.NewPassword);
            user.PasswordResetToken = null;
            user.PasswordResetTokenExpiry = null;

            await _context.SaveChangesAsync();
            return true;
        }

        public async Task<bool> ChangePasswordAsync(int userId, ChangePasswordDto changePasswordDto)
        {
            var user = await _context.Users.FindAsync(userId);
            if (user == null || !user.IsActive)
                return false;

            if (!BCrypt.Net.BCrypt.Verify(changePasswordDto.CurrentPassword, user.PasswordHash))
                return false;

            user.PasswordHash = BCrypt.Net.BCrypt.HashPassword(changePasswordDto.NewPassword);
            await _context.SaveChangesAsync();

            return true;
        }

        private string GenerateJwtToken(User user)
        {
            var jwtSettings = _configuration.GetSection("JwtSettings");
            var secretKey = Encoding.ASCII.GetBytes(jwtSettings["SecretKey"]!);

            var claims = new[]
            {
                new Claim(ClaimTypes.NameIdentifier, user.Id.ToString()),
                new Claim(ClaimTypes.Email, user.Email),
                new Claim(ClaimTypes.Role, user.Role.ToString()),
                new Claim(ClaimTypes.Name, $"{user.FirstName} {user.LastName}")
            };

            var tokenDescriptor = new SecurityTokenDescriptor
            {
                Subject = new ClaimsIdentity(claims),
                Expires = DateTime.UtcNow.AddMinutes(int.Parse(jwtSettings["ExpiryInMinutes"]!)),
                Issuer = jwtSettings["Issuer"],
                Audience = jwtSettings["Audience"],
                SigningCredentials = new SigningCredentials(new SymmetricSecurityKey(secretKey),
                    SecurityAlgorithms.HmacSha256Signature)
            };

            var tokenHandler = new JwtSecurityTokenHandler();
            var token = tokenHandler.CreateToken(tokenDescriptor);
            return tokenHandler.WriteToken(token);
        }
    }
}