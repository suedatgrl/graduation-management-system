using AutoMapper;
using GraduationProjectManagement.Data;
using GraduationProjectManagement.DTOs;
using GraduationProjectManagement.Models;
using Microsoft.EntityFrameworkCore;

namespace GraduationProjectManagement.Services
{
    public class TeacherService : ITeacherService
    {
        private readonly AppDbContext _context;
        private readonly IMapper _mapper;

        public TeacherService(AppDbContext context, IMapper mapper)
        {
            _context = context;
            _mapper = mapper;
        }

        public async Task<IEnumerable<TeacherWithQuotaDto>> GetAllTeachersWithQuotaAsync()
        {
            var teachers = await _context.Users
                .Where(u => u.Role == UserRole.Teacher && u.IsActive)
                .Include(u => u.Projects.Where(p => p.IsActive))
                    .ThenInclude(p => p.Applications)
                .ToListAsync();

            var teacherDtos = teachers.Select(teacher => 
            {
                // Onaylanan öğrenci sayısını hesapla (sadece approved applications)
                var usedQuota = teacher.Projects
                    .SelectMany(p => p.Applications)
                    .Count(app => app.Status == ApplicationStatus.Approved);

                var totalQuota = teacher.TotalQuota ?? 0;
                var availableQuota = Math.Max(0, totalQuota - usedQuota);

                return new TeacherWithQuotaDto
                {
                    Id = teacher.Id,
                    FirstName = teacher.FirstName,
                    LastName = teacher.LastName,
                    Email = teacher.Email,
                    TotalQuota = totalQuota,
                    UsedQuota = usedQuota,
                    AvailableQuota = availableQuota,
                    Projects = teacher.Projects.Select(project => new ProjectDto
                    {
                        Id = project.Id,
                        Title = project.Title,
                        Description = project.Description,
                        Details = project.Details,
                        CourseCode = project.CourseCode,
                        MaxStudents = project.MaxStudents,
                        CurrentStudents = project.Applications.Count(a => a.Status == ApplicationStatus.Approved),
                        TotalApplications = project.Applications.Count(a => a.Status == ApplicationStatus.Pending || a.Status == ApplicationStatus.Approved),
                        MaxApplications = project.MaxStudents + 2,
                        RemainingApplicationSlots = Math.Max(0, (project.MaxStudents + 2) - project.Applications.Count(a => a.Status == ApplicationStatus.Pending || a.Status == ApplicationStatus.Approved)),
                        RemainingStudentSlots = Math.Max(0, project.MaxStudents - project.Applications.Count(a => a.Status == ApplicationStatus.Approved)),
                        IsApplicationFull = project.Applications.Count(a => a.Status == ApplicationStatus.Pending || a.Status == ApplicationStatus.Approved) >= (project.MaxStudents + 2),
                        Teacher = new UserDto
                        {
                            Id = teacher.Id,
                            FirstName = teacher.FirstName,
                            LastName = teacher.LastName,
                            Email = teacher.Email,
                            Role = teacher.Role
                        },
                        IsActive = project.IsActive,
                        CreatedAt = project.CreatedAt
                    }).ToList()
                };
            }).ToList();

            return teacherDtos;
        }

        public async Task<TeacherWithQuotaDto?> GetTeacherWithProjectsAsync(int teacherId)
        {
            var teacher = await _context.Users
                .Where(u => u.Id == teacherId && u.Role == UserRole.Teacher && u.IsActive)
                .Include(u => u.Projects.Where(p => p.IsActive))
                    .ThenInclude(p => p.Applications)
                .FirstOrDefaultAsync();

            if (teacher == null)
                return null;

            // Onaylanan öğrenci sayısını hesapla (sadece approved applications)
            var usedQuota = teacher.Projects
                .SelectMany(p => p.Applications)
                .Count(app => app.Status == ApplicationStatus.Approved);

            var totalQuota = teacher.TotalQuota ?? 0;
            var availableQuota = Math.Max(0, totalQuota - usedQuota);
            
            return new TeacherWithQuotaDto
            {
                Id = teacher.Id,
                FirstName = teacher.FirstName,
                LastName = teacher.LastName,
                Email = teacher.Email,
                TotalQuota = totalQuota,
                UsedQuota = usedQuota,
                AvailableQuota = availableQuota,
                Projects = teacher.Projects.Select(project => new ProjectDto
                {
                    Id = project.Id,
                    Title = project.Title,
                    Description = project.Description,
                    Details = project.Details,
                    CourseCode = project.CourseCode,
                    MaxStudents = project.MaxStudents,
                    CurrentStudents = project.Applications.Count(a => a.Status == ApplicationStatus.Approved),
                    TotalApplications = project.Applications.Count(a => a.Status == ApplicationStatus.Pending || a.Status == ApplicationStatus.Approved),
                    MaxApplications = project.MaxStudents + 2,
                    RemainingApplicationSlots = Math.Max(0, (project.MaxStudents + 2) - project.Applications.Count(a => a.Status == ApplicationStatus.Pending || a.Status == ApplicationStatus.Approved)),
                    RemainingStudentSlots = Math.Max(0, project.MaxStudents - project.Applications.Count(a => a.Status == ApplicationStatus.Approved)),
                    IsApplicationFull = project.Applications.Count(a => a.Status == ApplicationStatus.Pending || a.Status == ApplicationStatus.Approved) >= (project.MaxStudents + 2),
                    Teacher = new UserDto
                    {
                        Id = teacher.Id,
                        FirstName = teacher.FirstName,
                        LastName = teacher.LastName,
                        Email = teacher.Email,
                        Role = teacher.Role
                    },
                    IsActive = project.IsActive,
                    CreatedAt = project.CreatedAt
                }).ToList()
            };
        }
    }
}