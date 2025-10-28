using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using GraduationProjectManagement.Services;
using GraduationProjectManagement.DTOs;
using GraduationProjectManagement.Models;
using GraduationProjectManagement.Data;
using System.Security.Claims;
using Microsoft.EntityFrameworkCore;

namespace GraduationProjectManagement.Controllers
{
    [ApiController]
    [Route("api/[controller]")]
    public class ProjectsController : ControllerBase
    {
        private readonly AppDbContext _context; 
        private readonly IProjectService _projectService;
        private readonly ILogger<ProjectsController> _logger;

        public ProjectsController(IProjectService projectService,AppDbContext context, ILogger<ProjectsController> logger)
        {
            _projectService = projectService;
             _context = context;
              _logger = logger; 
        }

        [HttpGet]
        public async Task<IActionResult> GetProjects([FromQuery] string courseCode)
        {
            var projects = await _projectService.GetAllProjectsAsync(courseCode);
            return Ok(projects);
        }

        [HttpGet("{id}")]
        public async Task<IActionResult> GetProject(int id)
        {
            var project = await _projectService.GetProjectByIdAsync(id);
            if (project == null)
                return NotFound();
            return Ok(project);
        }

        [Authorize(Roles = "Teacher")]
        [HttpPost("create-project")]
        public async Task<IActionResult> CreateProject([FromBody] CreateProjectDto dto)
        {
            var teacherId = int.Parse(User.FindFirstValue(ClaimTypes.NameIdentifier)!);
            var project = await _projectService.CreateProjectAsync(dto, teacherId);
            return Ok(project);
        }

        [Authorize(Roles = "Teacher")]
        [HttpPut("{id}")]
        public async Task<IActionResult> UpdateProject(int id, [FromBody] UpdateProjectDto dto)
        {
            var teacherId = int.Parse(User.FindFirstValue(ClaimTypes.NameIdentifier)!);
            var updated = await _projectService.UpdateProjectAsync(id, dto, teacherId);
            if (updated == null)
                return NotFound();
            return Ok(updated);
        }

        [Authorize(Roles = "Teacher")]
        [HttpDelete("{id}")]
        public async Task<IActionResult> DeleteProject(int id)
        {
            var teacherId = int.Parse(User.FindFirstValue(ClaimTypes.NameIdentifier)!);
            var result = await _projectService.DeleteProjectAsync(id, teacherId);
            if (!result)
                return NotFound();
            return NoContent();
        }

        [Authorize(Roles = "Teacher")]
        [HttpGet("my")]
        public async Task<IActionResult> GetMyProjects()
        {
            var teacherId = int.Parse(User.FindFirstValue(ClaimTypes.NameIdentifier)!);
            var projects = await _projectService.GetTeacherProjectsAsync(teacherId);
            return Ok(projects);
        }


        [Authorize(Roles = "Teacher")]
[HttpPost("{id}/assign-students")]
public async Task<IActionResult> AssignStudents(int id, [FromBody] AssignStudentsDto dto)
{
    try
    {
        var teacherId = int.Parse(User.FindFirstValue(ClaimTypes.NameIdentifier)!);
        var result = await _projectService.AssignStudentsToProjectAsync(id, dto.StudentIds, teacherId);
        
        if (!result)
            return NotFound(new { message = "Proje bulunamadı." });

        return Ok(new { message = "Öğrenciler başarıyla atandı." });
    }
    catch (InvalidOperationException ex)
    {
        return BadRequest(new { message = ex.Message });
    }
}

[Authorize(Roles = "Teacher")]
[HttpGet("available-students")]
public async Task<IActionResult> GetAvailableStudents([FromQuery] string? courseCode)
{
    _logger?.LogInformation($"🔍 GetAvailableStudents called with courseCode: {courseCode}");

    try
    {
        var query = _context.Users
            .Where(u => u.Role == UserRole.Student && u.IsActive);

        // courseCode varsa, StartsWith ile filtrele
        if (!string.IsNullOrEmpty(courseCode))
        {
            // "BLM101" -> "BLM" ile başlayanları bul
            var prefix = courseCode.StartsWith("BLM") ? "BLM" : 
                        courseCode.StartsWith("COM") ? "COM" : courseCode;
            
            query = query.Where(u => u.CourseCode != null && u.CourseCode.StartsWith(prefix));
            
            _logger?.LogInformation($"📦 Filtering by prefix: {prefix}");
        }

        var students = await query
            .OrderBy(u => u.FirstName)
            .ThenBy(u => u.LastName)
            .Select(u => new
            {
                Id = u.Id,
                FirstName = u.FirstName ?? "",
                LastName = u.LastName ?? "",
                Email = u.Email ?? "",
                StudentNumber = u.StudentNumber ?? "",
                CourseCode = u.CourseCode ?? "",
                HasApprovedProject = _context.ProjectApplications
                    .Any(a => a.StudentId == u.Id && a.Status == ApplicationStatus.Approved)
            })
            .ToListAsync();

        _logger?.LogInformation($"✅ Found {students.Count} students");
        
        return Ok(students);
    }
    catch (Exception ex)
    {
        _logger?.LogError(ex, "❌ Error in GetAvailableStudents");
        return StatusCode(500, new { message = "Öğrenciler yüklenirken bir hata oluştu." });
    }
}
    }
}