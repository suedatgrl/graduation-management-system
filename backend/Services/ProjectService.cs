using AutoMapper;
using GraduationProjectManagement.Data;
using GraduationProjectManagement.DTOs;
using GraduationProjectManagement.Models;
using Microsoft.EntityFrameworkCore;

namespace GraduationProjectManagement.Services
{
    public class ProjectService : IProjectService
    {
        private readonly AppDbContext _context;
        private readonly IMapper _mapper;

        public ProjectService(AppDbContext context, IMapper mapper)
        {
            _context = context;
            _mapper = mapper;
        }

        public async Task<IEnumerable<ProjectDto>> GetProjectsByCourseAsync(string? courseCode = null)
        {
            var query = _context.Projects
                .Include(p => p.Teacher)
                .Include(p => p.Applications)
                .Where(p => p.IsActive);

            if (!string.IsNullOrEmpty(courseCode))
            {
                query = query.Where(p => p.CourseCode.StartsWith(courseCode.Substring(0, 3)));
            }

            var projects = await query.ToListAsync();
            
            // Her proje için counter'ları güncelle ve DTO'ya dönüştür
            return projects.Select(p => MapToProjectDto(p));
        }

        public async Task<ProjectDto?> GetProjectByIdAsync(int id, int? userId = null)
        {
            var query = _context.Projects
                .Include(p => p.Teacher)
                .Include(p => p.Applications)
                .Where(p => p.Id == id);

            if (userId.HasValue)
            {
                query = query.Where(p => p.TeacherId == userId.Value);
            }

            var project = await query.FirstOrDefaultAsync();
            
            return project != null ? MapToProjectDto(project) : null;
        }

        public async Task<IEnumerable<ProjectDto>> GetTeacherProjectsAsync(int teacherId)
        {
            var projects = await _context.Projects
                .Include(p => p.Teacher)
                .Include(p => p.Applications)
                .Where(p => p.TeacherId == teacherId && p.IsActive)
                .ToListAsync();

            return projects.Select(p => MapToProjectDto(p));
        }

        public async Task<ProjectDto> CreateProjectAsync(CreateProjectDto dto, int teacherId)
        {
            var project = new Project
            {
                Title = dto.Title,
                Description = dto.Description,
                Details = dto.Details,
                CourseCode = dto.CourseCode,
                MaxStudents = dto.MaxStudents,
                TeacherId = teacherId,
                CreatedAt = DateTime.UtcNow,
                IsActive = true,
                CurrentStudents = 0,
                TotalApplications = 0
            };

            _context.Projects.Add(project);
            await _context.SaveChangesAsync();

            // Tekrar yükle (Teacher bilgisi ile birlikte)
            var createdProject = await _context.Projects
                .Include(p => p.Teacher)
                .Include(p => p.Applications)
                .FirstOrDefaultAsync(p => p.Id == project.Id);

            return MapToProjectDto(createdProject!);
        }

        public async Task<ProjectDto?> UpdateProjectAsync(int id, UpdateProjectDto dto, int teacherId)
        {
            var project = await _context.Projects
                .Include(p => p.Teacher)
                .Include(p => p.Applications)
                .FirstOrDefaultAsync(p => p.Id == id && p.TeacherId == teacherId);

            if (project == null)
                return null;

            project.Title = dto.Title;
            project.Description = dto.Description;
            project.Details = dto.Details;
            project.MaxStudents = dto.MaxStudents;
            project.IsActive = dto.IsActive;

            // Eğer MaxStudents değiştirilmişse, counter'ları yeniden hesapla
            await UpdateProjectCountersAsync(project);

            await _context.SaveChangesAsync();

            return MapToProjectDto(project);
        }

        public async Task<bool> DeleteProjectAsync(int id, int teacherId)
        {
            var project = await _context.Projects
                .FirstOrDefaultAsync(p => p.Id == id && p.TeacherId == teacherId);

            if (project == null)
                return false;

            // Soft delete
            project.IsActive = false;
            await _context.SaveChangesAsync();

            return true;
        }

        // Yeni eklenen metod: Project'i DTO'ya dönüştürürken counter'ları hesapla
        private ProjectDto MapToProjectDto(Project project)
        {
            // Counter'ları gerçek zamanlı hesapla
            var currentStudents = project.Applications
                .Count(a => a.Status == ApplicationStatus.Approved);

            var totalApplications = project.Applications
                .Count(a => a.Status == ApplicationStatus.Pending || a.Status == ApplicationStatus.Approved);

            var maxApplications = project.MaxStudents + 2;

            return new ProjectDto
            {
                Id = project.Id,
                Title = project.Title,
                Description = project.Description,
                Details = project.Details,
                CourseCode = project.CourseCode,
                MaxStudents = project.MaxStudents,
                CurrentStudents = currentStudents,
                TotalApplications = totalApplications,
                MaxApplications = maxApplications,
                RemainingApplicationSlots = Math.Max(0, maxApplications - totalApplications),
                RemainingStudentSlots = Math.Max(0, project.MaxStudents - currentStudents),
                IsApplicationFull = totalApplications >= maxApplications,
                Teacher = _mapper.Map<UserDto>(project.Teacher),
                IsActive = project.IsActive,
                CreatedAt = project.CreatedAt
            };
        }

        // Counter'ları güncelleme metodu
        private async Task UpdateProjectCountersAsync(Project project)
        {
            // Onaylanan öğrenci sayısı
            project.CurrentStudents = project.Applications
                .Count(a => a.Status == ApplicationStatus.Approved);

            // Toplam aktif başvuru sayısı (pending + approved)
            project.TotalApplications = project.Applications
                .Count(a => a.Status == ApplicationStatus.Pending || a.Status == ApplicationStatus.Approved);

            _context.Projects.Update(project);
        }

        public async Task RefreshProjectCountersAsync(int projectId)
        {
            var project = await _context.Projects
                .Include(p => p.Applications)
                .FirstOrDefaultAsync(p => p.Id == projectId);

            if (project != null)
            {
                await UpdateProjectCountersAsync(project);
                await _context.SaveChangesAsync();
            }
        }

        public async Task<IEnumerable<ProjectDto>> GetAllProjectsAsync(string courseCode)
        {
            var query = _context.Projects
                .Include(p => p.Teacher)
                .Where(p => p.IsActive);


            if (!string.IsNullOrEmpty(courseCode))
            {
                 query = query.Where(p => p.CourseCode.StartsWith(courseCode));
            }

            var projects = await query.ToListAsync();
            return _mapper.Map<IEnumerable<ProjectDto>>(projects);
        }

        public Task<ProjectDto?> GetProjectByIdAsync(int id)
        {
            throw new NotImplementedException();
        }

 


public async Task<bool> AssignStudentsToProjectAsync(int projectId, List<int> studentIds, int teacherId)
{
    var project = await _context.Projects
        .Include(p => p.Applications)
        .FirstOrDefaultAsync(p => p.Id == projectId && p.TeacherId == teacherId && p.IsActive);

    if (project == null)
        return false;

    // Kontenjan kontrolü
    var currentApproved = project.Applications.Count(a => a.Status == ApplicationStatus.Approved);
    if (currentApproved + studentIds.Count > project.MaxStudents)
    {
        throw new InvalidOperationException("Seçilen öğrenci sayısı kontenjanı aşıyor.");
    }

    foreach (var studentId in studentIds)
    {
        // Öğrenci zaten başvurmuş mu kontrol et
        var existingApplication = await _context.ProjectApplications
            .FirstOrDefaultAsync(a => a.ProjectId == projectId && a.StudentId == studentId);

        if (existingApplication == null)
        {
            // Yeni başvuru oluştur
            var application = new ProjectApplication
            {
                ProjectId = projectId,
                StudentId = studentId,
                Status = ApplicationStatus.Approved,
                AppliedAt = DateTime.UtcNow,
                ReviewedAt = DateTime.UtcNow,
                ReviewNotes = "Öğretmen tarafından manuel olarak atandı."
            };
            _context.ProjectApplications.Add(application);
        }
        else if (existingApplication.Status == ApplicationStatus.Pending)
        {
            // Bekleyen başvuruyu onayla
            existingApplication.Status = ApplicationStatus.Approved;
            existingApplication.ReviewedAt = DateTime.UtcNow;
            existingApplication.ReviewNotes = "Öğretmen tarafından manuel olarak onaylandı.";
        }
    }

    await _context.SaveChangesAsync();
    await RefreshProjectCountersAsync(projectId);

    return true;
}

    }
}