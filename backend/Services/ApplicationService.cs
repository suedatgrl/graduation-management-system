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

        public async Task<ApplicationDto?> ApplyToProjectAsync(CreateApplicationDto applicationDto, int studentId)
        {
            // Öğrenci zaten bir projeye başvurmuş mu kontrolü
            var existingApplication = await _context.ProjectApplications
                .FirstOrDefaultAsync(pa => pa.StudentId == studentId && pa.Status == ApplicationStatus.Approved);

            if (existingApplication != null)
            {
                return null; // Zaten onaylanmış bir başvurusu var
            }

            // Aynı projeye daha önce başvurmuş mu kontrolü
            var duplicateApplication = await _context.ProjectApplications
                .FirstOrDefaultAsync(pa => pa.StudentId == studentId && pa.ProjectId == applicationDto.ProjectId);

            if (duplicateApplication != null)
            {
                return null; // Aynı projeye zaten başvurmuş
            }

            // Proje kontrolü
            var project = await _context.Projects
                .Include(p => p.Teacher)
                .FirstOrDefaultAsync(p => p.Id == applicationDto.ProjectId && p.IsActive);

            if (project == null || project.CurrentStudents >= project.MaxStudents)
            {
                return null; // Proje bulunamadı veya kontenjan dolu
            }

            // Son tarih kontrolü
            var deadline = await GetApplicationDeadlineAsync();
            if (DateTime.UtcNow > deadline)
            {
                return null; // Son tarih geçmiş
            }

            var application = new ProjectApplication
            {
                StudentId = studentId,
                ProjectId = applicationDto.ProjectId,
                AppliedAt = DateTime.UtcNow,
                Status = ApplicationStatus.Pending
            };

            _context.ProjectApplications.Add(application);
            await _context.SaveChangesAsync();

            // İlişkili verileri yükle
            await _context.Entry(application)
                .Reference(a => a.Student)
                .LoadAsync();
            await _context.Entry(application)
                .Reference(a => a.Project)
                .LoadAsync();

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

        public async Task<ApplicationDto?> ReviewApplicationAsync(int applicationId, ReviewApplicationDto reviewDto, int teacherId)
        {
            var application = await _context.ProjectApplications
                .Include(pa => pa.Project)
                .Include(pa => pa.Student)
                .FirstOrDefaultAsync(pa => pa.Id == applicationId && pa.Project.TeacherId == teacherId);

            if (application == null || application.Status != ApplicationStatus.Pending)
            {
                return null;
            }

            // Eğer onaylanıyorsa, projenin kontenjanı kontrol et
            if (reviewDto.Status == ApplicationStatus.Approved)
            {
                if (application.Project.CurrentStudents >= application.Project.MaxStudents)
                {
                    return null; // Kontenjan dolu
                }

                // Proje sayısını artır
                application.Project.CurrentStudents++;
            }

            application.Status = reviewDto.Status;
            application.ReviewedAt = DateTime.UtcNow;

            await _context.SaveChangesAsync();

            return _mapper.Map<ApplicationDto>(application);
        }

        public async Task<bool> WithdrawApplicationAsync(int applicationId, int studentId)
        {
            var application = await _context.ProjectApplications
                .Include(pa => pa.Project)
                .FirstOrDefaultAsync(pa => pa.Id == applicationId && pa.StudentId == studentId);

            if (application == null || application.Status == ApplicationStatus.Approved)
            {
                return false; // Bulunamadı veya zaten onaylanmış
            }
            await _context.SaveChangesAsync();

            return true;
        }

        public async Task<bool> CanStudentApplyAsync(int studentId)
        {
            // Öğrencinin onaylanmış bir başvurusu var mı?
            var hasApprovedApplication = await _context.ProjectApplications
                .AnyAsync(pa => pa.StudentId == studentId && pa.Status == ApplicationStatus.Approved);

            if (hasApprovedApplication)
            {
                return false;
            }

            // Son tarih geçmiş mi?
            var deadline = await GetApplicationDeadlineAsync();
            return DateTime.UtcNow <= deadline;
        }

        private async Task<DateTime> GetApplicationDeadlineAsync()
        {
            var setting = await _context.SystemSettings
                .FirstOrDefaultAsync(s => s.Key == "ApplicationDeadline");

            if (setting != null && DateTime.TryParse(setting.Value, out var deadline))
            {
                return deadline;
            }

            return DateTime.UtcNow.AddDays(-1); // Varsayılan olarak geçmiş bir tarih
        }
    }
}