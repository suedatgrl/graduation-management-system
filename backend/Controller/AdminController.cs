using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using GraduationProjectManagement.Services;
using GraduationProjectManagement.Models;
using GraduationProjectManagement.DTOs;
using System.Security.Claims;

namespace GraduationProjectManagement.Controllers
{
    [ApiController]
    [Route("api/[controller]")]
    [Authorize(Roles = "Admin")]
    public class AdminController : ControllerBase
    {
        private readonly IAdminService _adminService;

        public AdminController(IAdminService adminService)
        {
            _adminService = adminService;
        }

        [HttpGet("settings")]
        public async Task<IActionResult> GetSettings()
        {
            var settings = await _adminService.GetAllSettingsAsync();
            return Ok(settings);
        }

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
        public async Task<IActionResult> BulkUploadUsers([FromForm] BulkUserUploadDto dto)
        {
            try
            {
                var users = await _adminService.BulkUploadUsersAsync(dto.ExcelFile, dto.UserType);
                return Ok(new { Message = $"{users.Count()} kullanıcı başarıyla eklendi.", Users = users });
            }
            catch (InvalidOperationException ex)
            {
                return BadRequest(ex.Message);
            }
        }


         [HttpPut("users/{userId}/toggle-status")]
         public async Task<IActionResult> ToggleUserStatus(int userId)
        {
        var user = await _adminService.ToggleUserStatusAsync(userId);
        return Ok(user);
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
        await _adminService.DeleteUserAsync(userId);
        return Ok(new { message = "Kullanıcı silindi." });
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




    }



    public class UpdateSettingDto
    {
        public string Value { get; set; } = string.Empty;
    }
}