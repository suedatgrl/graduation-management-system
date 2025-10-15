using Microsoft.EntityFrameworkCore;
using AutoMapper;
using GraduationProjectManagement.Data;
using GraduationProjectManagement.DTOs;
using GraduationProjectManagement.Models;


namespace GraduationProjectManagement.Services
{
    public class ApplicationService : IApplicationService
    {
        private readonly AppDbContext _context;
        private readonly IMapper _mapper;

        public ApplicationService(AppDbContext context, IMapper mapper)
        {
            _context = context;
            _mapper = mapper;
        }

        public async Task<ApplicationDto?> ApplyToProjectAsync(CreateApplicationDto dto, int studentId)
        {
            var project = await _context.Projects
                .Include(p => p.Applications)
                .FirstOrDefaultAsync(p => p.Id == dto.ProjectId && p.IsActive);

            if (project == null)
                return null;

            // Öğrenci daha önce başvurmuş mu kontrol et
            var existingApplication = await _context.ProjectApplications
                .FirstOrDefaultAsync(pa => pa.ProjectId == dto.ProjectId && pa.StudentId == studentId);

            if (existingApplication != null)
                return null;

            // Öğrencinin başka bir aktif başvurusu var mı kontrol et
            var hasActiveApplication = await _context.ProjectApplications
                .AnyAsync(pa => pa.StudentId == studentId && 
                              (pa.Status == ApplicationStatus.Pending || pa.Status == ApplicationStatus.Approved));

            if (hasActiveApplication)
                return null;

            // Başvuru kontenjanı kontrol et (MaxStudents + 2)
            var maxApplications = project.MaxStudents + 2;
            var currentApplicationCount = project.Applications
                .Count(a => a.Status == ApplicationStatus.Pending || a.Status == ApplicationStatus.Approved);

            if (currentApplicationCount >= maxApplications)
                return null;

            var application = new ProjectApplication
            {
                ProjectId = dto.ProjectId,
                StudentId = studentId,
                AppliedAt = DateTime.UtcNow,
                Status = ApplicationStatus.Pending
            };

            _context.ProjectApplications.Add(application);

            // Project'in TotalApplications sayısını güncelle
            await UpdateProjectCountersAsync(project.Id);

            await _context.SaveChangesAsync();

            var result = await _context.ProjectApplications
                .Include(pa => pa.Project)
                .Include(pa => pa.Student)
                .FirstOrDefaultAsync(pa => pa.Id == application.Id);

            return _mapper.Map<ApplicationDto>(result);
        }

        public async Task<ApplicationDto?> ReviewApplicationAsync(int applicationId, ReviewApplicationDto dto, int teacherId)
        {
            var application = await _context.ProjectApplications
                .Include(pa => pa.Project)
                .Include(pa => pa.Student)
                .FirstOrDefaultAsync(pa => pa.Id == applicationId && pa.Project.TeacherId == teacherId);

            if (application == null || application.Status != ApplicationStatus.Pending)
                return null;

            application.Status = dto.Status;
            application.ReviewedAt = DateTime.UtcNow;

            // Project counter'larını güncelle
            await UpdateProjectCountersAsync(application.ProjectId);

            await _context.SaveChangesAsync();

            return _mapper.Map<ApplicationDto>(application);
        }

        public async Task<IEnumerable<ApplicationDto>> GetStudentApplicationsAsync(int studentId)
        {
            var applications = await _context.ProjectApplications
                .Include(pa => pa.Project)
                .Include(pa => pa.Student)
                .Where(pa => pa.StudentId == studentId)
                .OrderByDescending(pa => pa.AppliedAt)
                .ToListAsync();

            return _mapper.Map<IEnumerable<ApplicationDto>>(applications);
        }

        public async Task<IEnumerable<ApplicationDto>> GetProjectApplicationsAsync(int projectId, int teacherId)
        {
            var applications = await _context.ProjectApplications
                .Include(pa => pa.Project)
                .Include(pa => pa.Student)
                .Where(pa => pa.ProjectId == projectId && pa.Project.TeacherId == teacherId)
                .OrderByDescending(pa => pa.AppliedAt)
                .ToListAsync();

            return _mapper.Map<IEnumerable<ApplicationDto>>(applications);
        }

        private async Task UpdateProjectCountersAsync(int projectId)
        {
            var project = await _context.Projects
                .Include(p => p.Applications)
                .FirstOrDefaultAsync(p => p.Id == projectId);

            if (project != null)
            {
                // Onaylanan öğrenci sayısı
                project.CurrentStudents = project.Applications
                    .Count(a => a.Status == ApplicationStatus.Approved);

                // Toplam aktif başvuru sayısı (pending + approved)
                project.TotalApplications = project.Applications
                    .Count(a => a.Status == ApplicationStatus.Pending || a.Status == ApplicationStatus.Approved);

                _context.Projects.Update(project);
            }
        }

        public async Task<bool> WithdrawApplicationAsync(int applicationId, int studentId)
        {
            var application = await _context.ProjectApplications
                .Include(pa => pa.Project)
                .FirstOrDefaultAsync(pa => pa.Id == applicationId && pa.StudentId == studentId);

            if (application == null || application.Status != ApplicationStatus.Pending)
                return false;

            _context.ProjectApplications.Remove(application);

            // Project counter'larını güncelle
            await UpdateProjectCountersAsync(application.ProjectId);

            await _context.SaveChangesAsync();
            return true;
        }

        public Task<bool> CanStudentApplyAsync(int studentId)
        {
            throw new NotImplementedException();
        }
    }
}