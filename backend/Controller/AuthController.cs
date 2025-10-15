using GraduationProjectManagement.DTOs;
using GraduationProjectManagement.Services;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using System.Security.Claims;

namespace GraduationProjectManagement.Controllers
{
    [ApiController]
    [Route("api/[controller]")]
    public class AuthController : ControllerBase
    {
        private readonly IAuthService _authService;

        public AuthController(IAuthService authService)
        {
            _authService = authService;
        }

        [HttpPost("login")]
        public async Task<IActionResult> Login([FromBody] LoginRequestDto loginDto)
        {
            if (!ModelState.IsValid)
                return BadRequest(ModelState);

            var result = await _authService.LoginAsync(loginDto);
            
            if (result == null)
                return Unauthorized(new { message = "Geçersiz kullanıcı adı, şifre veya kullanıcı bulunamadı." });

            return Ok(result);
        }

        [HttpGet("me")]
        [Authorize]
        public async Task<IActionResult> GetCurrentUser()
        {
            var userIdClaim = User.FindFirst(ClaimTypes.NameIdentifier)?.Value;
            
            if (userIdClaim == null || !int.TryParse(userIdClaim, out int userId))
                return Unauthorized();

            var user = await _authService.GetUserByIdAsync(userId);
            
            if (user == null)
                return NotFound(new { message = "Kullanıcı bulunamadı." });

            return Ok(user);
        }

        [HttpPost("forgot-password")]
        public async Task<IActionResult> ForgotPassword([FromBody] ForgotPasswordDto forgotPasswordDto)
        {
            if (!ModelState.IsValid)
                return BadRequest(ModelState);

            await _authService.ForgotPasswordAsync(forgotPasswordDto);
            return Ok(new { message = "Eğer e-mail adresi sistemde kayıtlıysa, şifre sıfırlama bağlantısı gönderildi." });
        }

        [HttpPost("reset-password")]
        public async Task<IActionResult> ResetPassword([FromBody] ResetPasswordDto resetPasswordDto)
        {
            if (!ModelState.IsValid)
                return BadRequest(ModelState);

            var result = await _authService.ResetPasswordAsync(resetPasswordDto);
            
            if (!result)
                return BadRequest(new { message = "Geçersiz veya süresi dolmuş sıfırlama bağlantısı." });

            return Ok(new { message = "Şifreniz başarıyla sıfırlandı." });
        }

        [HttpPost("change-password")]
        [Authorize]
        public async Task<IActionResult> ChangePassword([FromBody] ChangePasswordDto changePasswordDto)
        {
            if (!ModelState.IsValid)
                return BadRequest(ModelState);

            var userIdClaim = User.FindFirst(ClaimTypes.NameIdentifier)?.Value;
            
            if (userIdClaim == null || !int.TryParse(userIdClaim, out int userId))
                return Unauthorized();

            var result = await _authService.ChangePasswordAsync(userId, changePasswordDto);
            
            if (!result)
                return BadRequest(new { message = "Mevcut şifre yanlış." });

            return Ok(new { message = "Şifreniz başarıyla değiştirildi." });
        }
    }
}