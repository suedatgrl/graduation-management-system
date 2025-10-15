using GraduationProjectManagement.Services;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;

namespace GraduationProjectManagement.Controllers
{
    [ApiController]
    [Route("api/[controller]")]
    public class TeachersController : ControllerBase
    {
        private readonly ITeacherService _teacherService;

        public TeachersController(ITeacherService teacherService)
        {
            _teacherService = teacherService;
        }

        [HttpGet]
        [Authorize(Roles = "Student")]
        public async Task<IActionResult> GetAllTeachers()
        {
            var teachers = await _teacherService.GetAllTeachersWithQuotaAsync();
            return Ok(teachers);
        }

        [HttpGet("{id}/projects")]
        [Authorize(Roles = "Student")]
        public async Task<IActionResult> GetTeacherProjects(int id)
        {
            var teacher = await _teacherService.GetTeacherWithProjectsAsync(id);
            
            if (teacher == null)
                return NotFound(new { message = "Öğretim üyesi bulunamadı." });

            return Ok(teacher);
        }
    }
}