using Microsoft.AspNetCore.Mvc;
using Microsoft.AspNetCore.Authorization;
using System.Security.Claims;
using GraduationProjectManagement.Services;
using GraduationProjectManagement.DTOs;
using GraduationProjectManagement.Models;
using Microsoft.EntityFrameworkCore;
using GraduationProjectManagement.Data;

namespace GraduationProjectManagement.Controller
{
    [Authorize]
    [ApiController]
    [Route("api/[controller]")]

    public class AdminController : ControllerBase
    {
        private readonly IAdminService _adminService;
        private readonly AppDbContext _context;  // YENİ

        public AdminController(IAdminService adminService, AppDbContext context)  // GÜNCELLEME
        {
            _adminService = adminService;
            _context = context;  // YENİ
        }
        [Authorize]
        [HttpGet("settings")]
        public async Task<IActionResult> GetSettings()
        {
            var settings = await _adminService.GetAllSettingsAsync();

            foreach (var setting in settings)
            {
                Console.WriteLine($"Key: {setting.Key}, Value: {setting.Value}");
            }
            return Ok(settings);
        }

        [AllowAnonymous]
        [HttpGet("settings/{key}")]
        public async Task<IActionResult> GetSetting(string key)
        {
            var setting = await _adminService.GetSettingAsync(key);
            if (setting == null)
                return NotFound();
            return Ok(setting);
        }

        [HttpPut("settings/{key}")]
        public async Task<IActionResult> UpdateSetting(string key, [FromBody] UpdateSettingDto dto)
        {
            var updatedBy = int.Parse(User.FindFirstValue(ClaimTypes.NameIdentifier)!);
            var setting = await _adminService.UpdateSettingAsync(key, dto.Value, updatedBy);
            return Ok(setting);
        }

        [HttpGet("dashboard-stats")]
        public async Task<IActionResult> GetDashboardStats()
        {
            var stats = await _adminService.GetDashboardStatsAsync();
            return Ok(stats);
        }
        [HttpGet("students")]
        public async Task<IActionResult> GetStudents()
        {
            var students = await _adminService.GetStudentsAsync();
            return Ok(students);
        }

        [HttpGet("teachers")]
        public async Task<IActionResult> GetTeachers()
        {
            var teachers = await _adminService.GetTeachersAsync();
            return Ok(teachers);
        }

        [HttpGet("projects")]
        public async Task<IActionResult> GetProjects()
        {
            var projects = await _adminService.GetProjectsAsync();
            return Ok(projects);
        }

        [HttpPut("users/{userId}")]
        public async Task<IActionResult> UpdateUser(int userId, [FromBody] UpdateUserDto dto)
        {
            try
            {
                var updatedUser = await _adminService.UpdateUserAsync(userId, dto);
                return Ok(new
                {
                    message = "Kullanıcı başarıyla güncellendi.",
                    user = updatedUser
                });
            }
            catch (InvalidOperationException ex)
            {
                return BadRequest(new { message = ex.Message });
            }
            catch (Exception ex)
            {
                return StatusCode(500, new { message = "Kullanıcı güncellenirken bir hata oluştu." });
            }
        }





        [HttpGet("pending-applications")]
        public async Task<IActionResult> GetPendingApplications()
        {
            var applications = await _context.ProjectApplications
                .Include(pa => pa.Student)
                .Include(pa => pa.Project)
                .Where(pa => pa.Status == ApplicationStatus.Pending)
                .OrderByDescending(pa => pa.AppliedAt)
                .Select(pa => new
                {
                    pa.Id,
                    pa.ProjectId,
                    ProjectTitle = pa.Project.Title,
                    Student = new
                    {
                        pa.Student.Id,
                        pa.Student.FirstName,
                        pa.Student.LastName,
                        pa.Student.Email,
                        pa.Student.StudentNumber
                    },
                    pa.AppliedAt,
                    pa.Status
                })
                .ToListAsync();

            return Ok(applications);
        }

        [HttpPost("add-student")]
        public async Task<IActionResult> AddStudent([FromBody] CreateStudentDto dto)
        {
            try
            {
                var user = await _adminService.AddStudentAsync(dto);
                return Ok(user);
            }
            catch (InvalidOperationException ex)
            {
                return BadRequest(ex.Message);
            }
        }

        [HttpPost("add-teacher")]
        public async Task<IActionResult> AddTeacher([FromBody] CreateTeacherDto dto)
        {
            try
            {
                var user = await _adminService.AddTeacherAsync(dto);
                return Ok(user);
            }
            catch (InvalidOperationException ex)
            {
                return BadRequest(ex.Message);
            }
        }

        [HttpPost("bulk-upload")]
        public async Task<IActionResult> BulkUpload([FromForm] IFormFile excelFile, [FromForm] string userType)
        {
            try
            {
                var role = userType.ToLower() == "student" ? UserRole.Student : UserRole.Teacher;
                var users = await _adminService.BulkUploadUsersAsync(excelFile, role);
                return Ok(users);
            }
            catch (InvalidOperationException ex)
            {
                return BadRequest(ex.Message);
            }
        }

        [HttpGet("users")]
        public async Task<IActionResult> GetAllUsers()
        {
            var users = await _adminService.GetAllUsersAsync();
            return Ok(users);
        }

        [HttpDelete("users/{userId}")]
        public async Task<IActionResult> DeleteUser(int userId)
        {
            try
            {
                await _adminService.DeleteUserAsync(userId);
                return Ok(new { message = "Kullanıcı başarıyla silindi." });
            }
            catch (InvalidOperationException ex)
            {
                return BadRequest(ex.Message);
            }
        }

        [HttpPut("users/{userId}/toggle-status")]
        public async Task<IActionResult> ToggleUserStatus(int userId)
        {
            try
            {
                var user = await _adminService.ToggleUserStatusAsync(userId);
                return Ok(user);
            }
            catch (InvalidOperationException ex)
            {
                return BadRequest(ex.Message);
            }
        }


        [HttpPut("settings/ReviewDeadline")]
        public async Task<IActionResult> UpdateReviewDeadline([FromBody] UpdateSettingDto dto)
        {
            var updatedBy = int.Parse(User.FindFirstValue(ClaimTypes.NameIdentifier)!);
            var setting = await _adminService.UpdateSettingAsync("ReviewDeadline", dto.Value, updatedBy);
            return Ok(setting);
        }


        public class UpdateSettingDto
        {
            public string Value { get; set; } = string.Empty;
        }
    }
}