using Microsoft.AspNetCore.Mvc;
using GraduationProjectManagement.Services;
using GraduationProjectManagement.DTOs;

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
            var result = await _authService.LoginAsync(loginDto);
            if (result == null)
                return Unauthorized("Geçersiz kimlik bilgileri veya kullanıcı rolü.");

            return Ok(result);
        }
    }
}