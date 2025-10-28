using AutoMapper;
using GraduationProjectManagement.DTOs;
using GraduationProjectManagement.Models;

namespace GraduationProjectManagement.Mappings
{
    public class MappingProfile : Profile
    {
        public MappingProfile()
        {
            // User mappings 
            CreateMap<User, UserDto>();  // AutoMapper otomatik olarak aynı isimdeki property'leri map eder
            
            CreateMap<RegisterRequestDto, User>()
                .ForMember(dest => dest.PasswordHash, opt => opt.Ignore())
                .ForMember(dest => dest.Id, opt => opt.Ignore())
                .ForMember(dest => dest.CreatedAt, opt => opt.Ignore())
                .ForMember(dest => dest.IsActive, opt => opt.Ignore());

            // Project mappings
            CreateMap<Project, ProjectDto>()
                .ForMember(dest => dest.Teacher, opt => opt.MapFrom(src => src.Teacher));
            CreateMap<CreateProjectDto, Project>()
                .ForMember(dest => dest.Id, opt => opt.Ignore())
                .ForMember(dest => dest.TeacherId, opt => opt.Ignore())
                .ForMember(dest => dest.CurrentStudents, opt => opt.Ignore())
                .ForMember(dest => dest.CreatedAt, opt => opt.Ignore())
                .ForMember(dest => dest.IsActive, opt => opt.Ignore());
            CreateMap<UpdateProjectDto, Project>()
                .ForAllMembers(opts => opts.Condition((src, dest, srcMember) => srcMember != null));

            // Application mappings 
            CreateMap<ProjectApplication, ApplicationDto>()
                .ForMember(dest => dest.Status, opt => opt.MapFrom(src => 
                    src.Status == ApplicationStatus.Pending ? "Pending" :
                    src.Status == ApplicationStatus.Approved ? "Approved" : "Rejected"))
                .ForMember(dest => dest.StudentNote, opt => opt.MapFrom(src => src.StudentNote)); 

            CreateMap<User, TeacherWithQuotaDto>()
                .ForMember(dest => dest.UsedQuota, 
                    opt => opt.MapFrom(src => src.Projects != null 
                        ? src.Projects.SelectMany(p => p.Applications)
                            .Count(a => a.Status == ApplicationStatus.Approved) 
                        : 0))
                .ForMember(dest => dest.AvailableQuota, 
                    opt => opt.MapFrom(src => (src.TotalQuota ?? 0) - (src.Projects != null 
                        ? src.Projects.SelectMany(p => p.Applications)
                            .Count(a => a.Status == ApplicationStatus.Approved) 
                        : 0)))
                .ForMember(dest => dest.Projects, 
                    opt => opt.MapFrom(src => src.Projects ?? new List<Project>()));

            // Admin DTOs
            CreateMap<CreateStudentDto, User>()
                .ForMember(dest => dest.Role, opt => opt.MapFrom(src => UserRole.Student))
                .ForMember(dest => dest.PasswordHash, opt => opt.Ignore())
                .ForMember(dest => dest.CreatedAt, opt => opt.MapFrom(src => DateTime.UtcNow))
                .ForMember(dest => dest.IsActive, opt => opt.MapFrom(src => true));

            CreateMap<CreateTeacherDto, User>()
                .ForMember(dest => dest.Role, opt => opt.MapFrom(src => UserRole.Teacher))
                .ForMember(dest => dest.PasswordHash, opt => opt.Ignore())
                .ForMember(dest => dest.CreatedAt, opt => opt.MapFrom(src => DateTime.UtcNow))
                .ForMember(dest => dest.IsActive, opt => opt.MapFrom(src => true));
        }
    }
}