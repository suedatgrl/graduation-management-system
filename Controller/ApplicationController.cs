using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using GraduationProjectManagement.Services;
using GraduationProjectManagement.DTOs;
using System.Security.Claims;

namespace GraduationProjectManagement.Controllers
{
    [ApiController]
    [Route("api/[controller]")]
    public class ApplicationsController : ControllerBase
    {
        private readonly IApplicationService _applicationService;

        public ApplicationsController(IApplicationService applicationService)
        {
            _applicationService = applicationService;
        }

        [Authorize(Roles = "Student")]
        [HttpPost]
        public async Task<IActionResult> Apply([FromBody] CreateApplicationDto dto)
        {
            var studentId = int.Parse(User.FindFirstValue(ClaimTypes.NameIdentifier)!);
            var application = await _applicationService.ApplyToProjectAsync(dto, studentId);
            if (application == null)
                return BadRequest("Başvuru yapılamadı. Kontenjan dolu, son tarih geçmiş ya da daha önce başvurdunuz.");
            return Ok(application);
        }

        [Authorize(Roles = "Student")]
        [HttpGet("my")]
        public async Task<IActionResult> GetMyApplications()
        {
            var studentId = int.Parse(User.FindFirstValue(ClaimTypes.NameIdentifier)!);
            var applications = await _applicationService.GetStudentApplicationsAsync(studentId);
            return Ok(applications);
        }

        [Authorize(Roles = "Teacher")]
        [HttpGet("project/{projectId}")]
        public async Task<IActionResult> GetApplicationsForProject(int projectId)
        {
            var teacherId = int.Parse(User.FindFirstValue(ClaimTypes.NameIdentifier)!);
            var applications = await _applicationService.GetProjectApplicationsAsync(projectId, teacherId);
            return Ok(applications);
        }

        [Authorize(Roles = "Teacher")]
        [HttpPost("{id}/review")]
        public async Task<IActionResult> ReviewApplication(int id, [FromBody] ReviewApplicationDto dto)
        {
            var teacherId = int.Parse(User.FindFirstValue(ClaimTypes.NameIdentifier)!);
            var result = await _applicationService.ReviewApplicationAsync(id, dto, teacherId);
            if (result == null)
                return BadRequest("Başvuru bulunamadı ya da işlem yapılamaz durumda.");
            return Ok(result);
        }

        [Authorize(Roles = "Student")]
        [HttpPost("{id}/withdraw")]
        public async Task<IActionResult> Withdraw(int id)
        {
            var studentId = int.Parse(User.FindFirstValue(ClaimTypes.NameIdentifier)!);
            var result = await _applicationService.WithdrawApplicationAsync(id, studentId);
            if (!result)
                return BadRequest("Başvuru geri çekilemedi.");
            return Ok();
        }

        [Authorize(Roles = "Student")]
        [HttpGet("can-apply")]
        public async Task<IActionResult> CanApply()
        {
            var studentId = int.Parse(User.FindFirstValue(ClaimTypes.NameIdentifier)!);
            var canApply = await _applicationService.CanStudentApplyAsync(studentId);
            return Ok(new { canApply });
        }
    }
}