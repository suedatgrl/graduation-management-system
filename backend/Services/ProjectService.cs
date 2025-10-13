using Microsoft.EntityFrameworkCore;
using AutoMapper;
using GraduationProjectManagement.Data;
using GraduationProjectManagement.DTOs;
using GraduationProjectManagement.Models;

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

        public async Task<IEnumerable<ProjectDto>> GetAllProjectsAsync(string courseCode)
        {
            var query = _context.Projects
                .Include(p => p.Teacher)
                .Where(p => p.IsActive);


            if (!string.IsNullOrEmpty(courseCode))
            {
                query = query.Where(p => p.CourseCode == courseCode);
            }

            var projects = await query.ToListAsync();
            return _mapper.Map<IEnumerable<ProjectDto>>(projects);
        }

        public async Task<ProjectDto?> GetProjectByIdAsync(int id)
        {
            var project = await _context.Projects
                .Include(p => p.Teacher)
                .FirstOrDefaultAsync(p => p.Id == id);

            return project != null ? _mapper.Map<ProjectDto>(project) : null;
        }

        public async Task<ProjectDto> CreateProjectAsync(CreateProjectDto createProjectDto, int teacherId)
        {
            var project = _mapper.Map<Project>(createProjectDto);
            project.TeacherId = teacherId;
            project.CreatedAt = DateTime.UtcNow;

            _context.Projects.Add(project);
            await _context.SaveChangesAsync();

            // Teacher bilgisini yükle
            await _context.Entry(project).Reference(p => p.Teacher).LoadAsync();

            return _mapper.Map<ProjectDto>(project);
        }

        public async Task<ProjectDto?> UpdateProjectAsync(int id, UpdateProjectDto updateProjectDto, int teacherId)
        {
            var project = await _context.Projects
                .Include(p => p.Teacher)
                .FirstOrDefaultAsync(p => p.Id == id && p.TeacherId == teacherId);

            if (project == null) return null;

            _mapper.Map(updateProjectDto, project);
            await _context.SaveChangesAsync();

            return _mapper.Map<ProjectDto>(project);
        }

        public async Task<bool> DeleteProjectAsync(int id, int teacherId)
        {
            var project = await _context.Projects
                .FirstOrDefaultAsync(p => p.Id == id && p.TeacherId == teacherId);

            if (project == null) return false;

            project.IsActive = false;
            await _context.SaveChangesAsync();
            return true;
        }

        public async Task<IEnumerable<ProjectDto>> GetTeacherProjectsAsync(int teacherId)
        {
            var projects = await _context.Projects
                .Include(p => p.Teacher)
                .Where(p => p.TeacherId == teacherId)
                .ToListAsync();

            return _mapper.Map<IEnumerable<ProjectDto>>(projects);
        }
    }
}