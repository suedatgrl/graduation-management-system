using AutoMapper;
using GraduationProjectManagement.DTOs;
using GraduationProjectManagement.Models;
using Microsoft.EntityFrameworkCore;
using GraduationProjectManagement.Data;

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
                .ToListAsync();

            var teacherDtos = teachers.Select(teacher => 
            {
                var usedQuota = teacher.Projects.Sum(p => p.CurrentStudents);
                return new TeacherWithQuotaDto
                {
                    Id = teacher.Id,
                    FirstName = teacher.FirstName,
                    LastName = teacher.LastName,
                    Email = teacher.Email,
                    TotalQuota = teacher.TotalQuota ?? 0,
                    UsedQuota = usedQuota,
                    AvailableQuota = (teacher.TotalQuota ?? 0) - usedQuota,
                    Projects = _mapper.Map<List<ProjectDto>>(teacher.Projects)
                };
            }).ToList();

            return teacherDtos;
        }

        public async Task<TeacherWithQuotaDto?> GetTeacherWithProjectsAsync(int teacherId)
        {
            var teacher = await _context.Users
                .Where(u => u.Id == teacherId && u.Role == UserRole.Teacher && u.IsActive)
                .Include(u => u.Projects.Where(p => p.IsActive))
                .FirstOrDefaultAsync();

            if (teacher == null)
                return null;

            var usedQuota = teacher.Projects.Sum(p => p.CurrentStudents);
            
            return new TeacherWithQuotaDto
            {
                Id = teacher.Id,
                FirstName = teacher.FirstName,
                LastName = teacher.LastName,
                Email = teacher.Email,
                TotalQuota = teacher.TotalQuota ?? 0,
                UsedQuota = usedQuota,
                AvailableQuota = (teacher.TotalQuota ?? 0) - usedQuota,
                Projects = _mapper.Map<List<ProjectDto>>(teacher.Projects)
            };
        }
    }
}