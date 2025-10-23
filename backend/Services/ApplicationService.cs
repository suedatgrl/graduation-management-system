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
        private readonly INotificationService _notificationService; 

         public ApplicationService(
            AppDbContext context, 
            IMapper mapper,
            INotificationService notificationService)  // YENİ PARAMETRE
        {
            _context = context;
            _mapper = mapper;
            _notificationService = notificationService;  // YENİ
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
                Status = ApplicationStatus.Pending,
                StudentNote = dto.StudentNote
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

 
 public async Task<ProjectApplicationDto?> ReviewApplicationAsync(
            int applicationId, 
            int teacherId, 
            ApplicationStatus newStatus, 
            string? reviewNotes)
        {

            var reviewDeadlineSetting = await _context.SystemSettings
                .FirstOrDefaultAsync(s => s.Key == "ReviewDeadline");

            if (reviewDeadlineSetting != null && !string.IsNullOrEmpty(reviewDeadlineSetting.Value))
            {
                if (DateTime.TryParse(reviewDeadlineSetting.Value, out var reviewDeadline))
                {
                    if (DateTime.UtcNow > reviewDeadline)
                    {
                        // Son tarih geçmiş
                        return null;
                    }
                }
            }
            var application = await _context.ProjectApplications
                .Include(pa => pa.Project)
                    .ThenInclude(p => p.Teacher)
                .Include(pa => pa.Student)
                .FirstOrDefaultAsync(pa => pa.Id == applicationId && pa.Project.TeacherId == teacherId);

            if (application == null)
                return null;

            application.Status = newStatus;
            application.ReviewNotes = reviewNotes;
            application.ReviewedAt = DateTime.UtcNow;

            await _context.SaveChangesAsync();

            // Bildirim gönder 
            try
            {
                if (newStatus == ApplicationStatus.Approved)
                {
                    await _notificationService.CreateNotificationAsync(
                        application.StudentId,
                        NotificationType.ApplicationApproved,
                        " Başvurunuz Onaylandı!",
                        $"'{application.Project.Title}' projesine başvurunuz onaylandı! Tebrikler!",
                        application.ProjectId,
                        application.Id
                    );
                }
                else if (newStatus == ApplicationStatus.Rejected)
                {
                    var message = string.IsNullOrEmpty(reviewNotes)
                        ? $"'{application.Project.Title}' projesine başvurunuz reddedildi."
                        : $"'{application.Project.Title}' projesine başvurunuz reddedildi. Not: {reviewNotes}";

                    await _notificationService.CreateNotificationAsync(
                        application.StudentId,
                        NotificationType.ApplicationRejected,
                        " Başvurunuz Reddedildi",
                        message,
                        application.ProjectId,
                        application.Id
                    );
                }
            }
            catch (Exception ex)
            {
                Console.WriteLine($"Bildirim gönderme hatası: {ex.Message}");
            }

            await UpdateProjectCountersAsync(application.ProjectId);
            
            return MapToApplicationDto(application);
        }

        public async Task<IEnumerable<ApplicationDto>> GetStudentApplicationsAsync(int studentId)
        {
            var applications = await _context.ProjectApplications
                .Include(pa => pa.Project)
                .Include(pa => pa.Student)
                .Where(pa => pa.StudentId == studentId)
                .OrderByDescending(pa => pa.AppliedAt)
                .ToListAsync();

            foreach (var app in applications)
            {
                Console.WriteLine($"Raw Application {app.Id}: Status = {app.Status} ({(int)app.Status})");
            }

            var result = _mapper.Map<IEnumerable<ApplicationDto>>(applications);


            foreach (var dto in result)
            {
                Console.WriteLine($"Mapped Application {dto.Id}: Status = '{dto.Status}'");
            }

            return result;


        }

         private async Task UpdateProjectCountersAsync(int projectId)
        {
            var project = await _context.Projects
                .Include(p => p.Applications)
                .FirstOrDefaultAsync(p => p.Id == projectId);

            if (project != null)
            {
                project.CurrentStudents = project.Applications
                    .Count(a => a.Status == ApplicationStatus.Approved);
                
                project.TotalApplications = project.Applications
                    .Count(a => a.Status == ApplicationStatus.Pending || 
                               a.Status == ApplicationStatus.Approved);

                await _context.SaveChangesAsync();
            }
        }

        private ProjectApplicationDto MapToApplicationDto(ProjectApplication application)
        {
            return new ProjectApplicationDto
            {
                Id = application.Id,
                ProjectId = application.ProjectId,
                ProjectTitle = application.Project?.Title ?? "",
                StudentId = application.StudentId,
                StudentName = $"{application.Student?.FirstName} {application.Student?.LastName}",
                StudentEmail = application.Student?.Email ?? "",
                StudentNumber = application.Student?.StudentNumber,
                Status = (int)application.Status,
                StatusText = application.Status switch
                {
                    ApplicationStatus.Pending => "Beklemede",
                    ApplicationStatus.Approved => "Onaylandı",
                    ApplicationStatus.Rejected => "Reddedildi",
                    _ => "Bilinmiyor"
                },
                AppliedAt = application.AppliedAt,
                ReviewedAt = application.ReviewedAt,
                ReviewNotes = application.ReviewNotes,
                StudentNote = application.StudentNote
            };
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