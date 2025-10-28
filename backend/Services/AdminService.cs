using Microsoft.EntityFrameworkCore;
using GraduationProjectManagement.Data;
using GraduationProjectManagement.Models;
using GraduationProjectManagement.DTOs;
using AutoMapper;
using OfficeOpenXml;

namespace GraduationProjectManagement.Services
{
    public class AdminService : IAdminService
    {
        private readonly AppDbContext _context;
        private readonly IMapper _mapper;

        public AdminService(AppDbContext context, IMapper mapper)
        {
            _context = context;
            _mapper = mapper;
        }

        public async Task<IEnumerable<SystemSettings>> GetAllSettingsAsync()
        {
            return await _context.SystemSettings
                .OrderBy(s => s.Key)
                .ToListAsync();
        }

        public async Task<SystemSettings?> GetSettingAsync(string key)
        {
            return await _context.SystemSettings
                .FirstOrDefaultAsync(s => s.Key == key);
        }

        public async Task<SystemSettings> UpdateSettingAsync(string key, string value, int updatedBy)
        {
            var setting = await _context.SystemSettings
                .FirstOrDefaultAsync(s => s.Key == key);

            if (setting == null)
            {
                setting = new SystemSettings
                {
                    Key = key,
                    Value = value,
                    UpdatedBy = updatedBy,
                    UpdatedAt = DateTime.UtcNow
                };
                _context.SystemSettings.Add(setting);
            }
            else
            {
                setting.Value = value;
                setting.UpdatedBy = updatedBy;
                setting.UpdatedAt = DateTime.UtcNow;
            }

            await _context.SaveChangesAsync();
            return setting;
        }

          public async Task<Dictionary<string, object>> GetDashboardStatsAsync()
        {
            var totalStudents = await _context.Users.CountAsync(u => u.Role == UserRole.Student);
            var totalTeachers = await _context.Users.CountAsync(u => u.Role == UserRole.Teacher);
            var activeStudents = await _context.Users.CountAsync(u => u.Role == UserRole.Student && u.IsActive);
            var activeTeachers = await _context.Users.CountAsync(u => u.Role == UserRole.Teacher && u.IsActive);
            var totalProjects = await _context.Projects.CountAsync();
            var activeProjects = await _context.Projects.CountAsync(p => p.IsActive);
            var totalApplications = await _context.ProjectApplications.CountAsync();
            var pendingApplications = await _context.ProjectApplications.CountAsync(pa => pa.Status == ApplicationStatus.Pending);
            var approvedApplications = await _context.ProjectApplications.CountAsync(pa => pa.Status == ApplicationStatus.Approved);
            var rejectedApplications = await _context.ProjectApplications.CountAsync(pa => pa.Status == ApplicationStatus.Rejected);
            
            // Course-based statistics
            var blmStudents = await _context.Users.CountAsync(u => u.Role == UserRole.Student && u.CourseCode != null && u.CourseCode.StartsWith("BLM"));
            var comStudents = await _context.Users.CountAsync(u => u.Role == UserRole.Student && u.CourseCode != null && u.CourseCode.StartsWith("COM"));
            var blmProjects = await _context.Projects.CountAsync(p => p.CourseCode != null && p.CourseCode.StartsWith("BLM"));
            var comProjects = await _context.Projects.CountAsync(p => p.CourseCode != null && p.CourseCode.StartsWith("COM"));

            return new Dictionary<string, object>
            {
                { "totalStudents", totalStudents },
                { "totalTeachers", totalTeachers },
                { "activeStudents", activeStudents },
                { "activeTeachers", activeTeachers },
                { "totalProjects", totalProjects },
                { "activeProjects", activeProjects },
                { "totalApplications", totalApplications },
                { "pendingApplications", pendingApplications },
                { "approvedApplications", approvedApplications },
                { "rejectedApplications", rejectedApplications },
                { "blmStudents", blmStudents },
                { "comStudents", comStudents },
                { "blmProjects", blmProjects },
                { "comProjects", comProjects }
            };
        }


        public async Task<UserDto> AddStudentAsync(CreateStudentDto studentDto)
        {
            // Check if user with email already exists
            if (await _context.Users.AnyAsync(u => u.Email == studentDto.Email))
            {
                throw new InvalidOperationException("Bu email ile kayıtlı kullanıcı zaten mevcut.");
            }

    
            // Check if school number already exists
            if (await _context.Users.AnyAsync(u => u.StudentNumber == studentDto.StudentNumber))
            {
                throw new InvalidOperationException("Bu okul numarası ile kayıtlı öğrenci zaten mevcut.");
            }

            // Generate username (school number) and password (first 8 digits of TC number)
            var username = studentDto.StudentNumber;
              var password = studentDto.StudentNumber;

            var user = new User
            {
                FirstName = studentDto.FirstName,
                LastName = studentDto.LastName,
                Email = studentDto.Email,
                PasswordHash = BCrypt.Net.BCrypt.HashPassword(password),
                Role = UserRole.Student,
                StudentNumber = studentDto.StudentNumber, // Using school number as student number
                CourseCode = studentDto.CourseCode,
                CreatedAt = DateTime.UtcNow,
                IsActive = true,
                MustChangePassword = true,  
                LastPasswordChangeDate = null 
            };

            _context.Users.Add(user);
            await _context.SaveChangesAsync();

            return _mapper.Map<UserDto>(user);
        }

         public async Task<UserDto> AddTeacherAsync(CreateTeacherDto teacherDto)
        {
            // Validation checks
            if (await _context.Users.AnyAsync(u => u.Email == teacherDto.Email))
            {
                throw new InvalidOperationException("Bu email ile kayıtlı kullanıcı zaten mevcut.");
            }

            if (await _context.Users.AnyAsync(u => u.SicilNumber == teacherDto.SicilNumber))
            {
                throw new InvalidOperationException("Bu Sicil numarası ile kayıtlı kullanıcı zaten mevcut.");
            }

            // Validate Sicil number length
            if (string.IsNullOrEmpty(teacherDto.SicilNumber) || teacherDto.SicilNumber.Length < 8)
            {
                throw new InvalidOperationException("Geçersiz Sicil numarası.");
            }

            // Generate password (first 8 digits of Sicil No)
            var password = teacherDto.SicilNumber.Substring(0, 8);

            var user = new User
            {
                FirstName = teacherDto.FirstName,
                LastName = teacherDto.LastName,
                Email = teacherDto.Email,
                PasswordHash = BCrypt.Net.BCrypt.HashPassword(password),
                Role = UserRole.Teacher,
                SicilNumber = teacherDto.SicilNumber,
                TotalQuota = teacherDto.TotalQuota,
                CreatedAt = DateTime.UtcNow,
                IsActive = true
            };

            _context.Users.Add(user);
            await _context.SaveChangesAsync();

            return _mapper.Map<UserDto>(user);
        }


         public async Task<IEnumerable<UserDto>> BulkUploadUsersAsync(IFormFile excelFile, UserRole userType)
        {
            if (excelFile == null || excelFile.Length == 0)
            {
                throw new InvalidOperationException("Dosya boş veya geçersiz.");
            }

            // Check file extension
            var fileExtension = Path.GetExtension(excelFile.FileName).ToLower();
            if (fileExtension != ".xlsx" && fileExtension != ".xls")
            {
                throw new InvalidOperationException("Sadece Excel dosyaları (.xlsx, .xls) yüklenebilir.");
            }

            var users = new List<User>();
            var errorMessages = new List<string>();
            ExcelPackage.LicenseContext = LicenseContext.NonCommercial;

            using (var stream = new MemoryStream())
            {
                await excelFile.CopyToAsync(stream);
                stream.Position = 0;
                using (var package = new ExcelPackage(stream))
                {
                    var worksheet = package.Workbook.Worksheets[0];
                    
                    if (worksheet.Dimension == null)
                    {
                        throw new InvalidOperationException("Excel dosyası boş.");
                    }

                    var rowCount = worksheet.Dimension.Rows;

                    if (rowCount < 2)
                    {
                        throw new InvalidOperationException("Excel dosyasında veri bulunamadı.");
                    }

                    for (int row = 2; row <= rowCount; row++)
                    {
                        try
                        {
                            if (userType == UserRole.Student)
                            {
                                var firstName = worksheet.Cells[row, 1].Value?.ToString()?.Trim();
                                var lastName = worksheet.Cells[row, 2].Value?.ToString()?.Trim();
                                var email = worksheet.Cells[row, 3].Value?.ToString()?.Trim();
                                var studentNumber = worksheet.Cells[row, 5].Value?.ToString()?.Trim();
                                var courseCode = worksheet.Cells[row, 6].Value?.ToString()?.Trim();

                                // Validate required fields
                                if (string.IsNullOrEmpty(firstName) || string.IsNullOrEmpty(lastName) || 
                                    string.IsNullOrEmpty(email)  ||
                                    string.IsNullOrEmpty(studentNumber))
                                {
                                    errorMessages.Add($"Satır {row}: Eksik bilgi");
                                    continue;
                                }

                            

                                // Check duplicates in database
                                if (await _context.Users.AnyAsync(u => u.Email == email))
                                {
                                    errorMessages.Add($"Satır {row}: Email zaten kayıtlı - {email}");
                                    continue;
                                }

                                

                                if (await _context.Users.AnyAsync(u => u.StudentNumber == studentNumber))
                                {
                                    errorMessages.Add($"Satır {row}: Öğrenci numarası zaten kayıtlı - {studentNumber}");
                                    continue;
                                }

                                // Check duplicates in current batch
                                if (users.Any(u => u.Email == email  || u.StudentNumber == studentNumber))
                                {
                                    errorMessages.Add($"Satır {row}: Excel içinde tekrarlanan bilgi");
                                    continue;
                                }

                                var password = studentNumber;
                                var user = new User
                                {
                                    FirstName = firstName,
                                    LastName = lastName,
                                    Email = email,
                                    PasswordHash = BCrypt.Net.BCrypt.HashPassword(password),
                                    Role = UserRole.Student,
                                    StudentNumber = studentNumber,
                                    CourseCode = courseCode,
                                    CreatedAt = DateTime.UtcNow,
                                    IsActive = true,
                                    MustChangePassword = true, 
                                    LastPasswordChangeDate = null 
                                };
                                users.Add(user);
                            }
                            else if (userType == UserRole.Teacher)
                            {
                                var firstName = worksheet.Cells[row, 1].Value?.ToString()?.Trim();
                                var lastName = worksheet.Cells[row, 2].Value?.ToString()?.Trim();
                                var email = worksheet.Cells[row, 3].Value?.ToString()?.Trim();
                                var sicilNumber = worksheet.Cells[row, 5].Value?.ToString()?.Trim();
                                var totalQuotaStr = worksheet.Cells[row, 6].Value?.ToString()?.Trim();

                                // Validate required fields
                                if (string.IsNullOrEmpty(firstName) || string.IsNullOrEmpty(lastName) || 
                                    string.IsNullOrEmpty(email) || string.IsNullOrEmpty(sicilNumber))
                                {
                                    errorMessages.Add($"Satır {row}: Eksik bilgi");
                                    continue;
                                }

                               

                                // Check duplicates in database
                                if (await _context.Users.AnyAsync(u => u.Email == email))
                                {
                                    errorMessages.Add($"Satır {row}: Email zaten kayıtlı - {email}");
                                    continue;
                                }

                                if (await _context.Users.AnyAsync(u => u.SicilNumber == sicilNumber))
                                {
                                    errorMessages.Add($"Satır {row}: Sicil numarası zaten kayıtlı");
                                    continue;
                                }

                                // Check duplicates in current batch
                                if (users.Any(u => u.Email == email || u.SicilNumber == sicilNumber))
                                {
                                    errorMessages.Add($"Satır {row}: Excel içinde tekrarlanan bilgi");
                                    continue;
                                }

                                // Parse total quota
                                var totalQuota = 10; // Default quota
                                if (!string.IsNullOrEmpty(totalQuotaStr) && int.TryParse(totalQuotaStr, out var parsedQuota))
                                {
                                    if (parsedQuota >= 1 && parsedQuota <= 20)
                                    {
                                        totalQuota = parsedQuota;
                                    }
                                    else
                                    {
                                        errorMessages.Add($"Satır {row}: Kontenjan 1-20 arasında olmalı, varsayılan 10 kullanıldı");
                                    }
                                }

                                var password = sicilNumber.Substring(0, 8);
                                var user = new User
                                {
                                    FirstName = firstName,
                                    LastName = lastName,
                                    Email = email,
                                    PasswordHash = BCrypt.Net.BCrypt.HashPassword(password),
                                    Role = UserRole.Teacher,
                                    SicilNumber = sicilNumber,
                                    TotalQuota = totalQuota,
                                    CreatedAt = DateTime.UtcNow,
                                    IsActive = true
                                };
                                users.Add(user);
                            }
                        }
                        catch (Exception ex)
                        {
                            errorMessages.Add($"Satır {row}: Hata - {ex.Message}");
                        }
                    }
                }
            }

            if (!users.Any())
            {
                var errorSummary = errorMessages.Any() 
                    ? $"Hiçbir kullanıcı eklenemedi. Hatalar:\n{string.Join("\n", errorMessages.Take(10))}" 
                    : "Excel dosyasında geçerli kullanıcı bulunamadı.";
                throw new InvalidOperationException(errorSummary);
            }

            _context.Users.AddRange(users);
            await _context.SaveChangesAsync();

            return users.Select(u => _mapper.Map<UserDto>(u)).ToList();
        }
     

     public async Task<IEnumerable<UserDto>> GetAllUsersAsync()
        {
            var users = await _context.Users
                .Where(u => u.Role != UserRole.Admin)
                .OrderByDescending(u => u.CreatedAt)
                .ToListAsync();

            return users.Select(u => _mapper.Map<UserDto>(u)).ToList();
        }

        public async Task<bool> DeleteUserAsync(int userId)
        {
            var user = await _context.Users.FindAsync(userId);
            
            if (user == null)
            {
                throw new InvalidOperationException("Kullanıcı bulunamadı.");
            }

            // Prevent deleting admin users
            if (user.Role == UserRole.Admin)
            {
                throw new InvalidOperationException("Admin kullanıcıları silinemez.");
            }

            // Check for related data
            if (user.Role == UserRole.Teacher)
            {
                var hasProjects = await _context.Projects.AnyAsync(p => p.TeacherId == userId);
                if (hasProjects)
                {
                    throw new InvalidOperationException("Bu öğretim üyesinin projeleri bulunmaktadır. Önce projeleri silmelisiniz.");
                }
            }
            else if (user.Role == UserRole.Student)
            {
                var hasApplications = await _context.ProjectApplications.AnyAsync(pa => pa.StudentId == userId);
                if (hasApplications)
                {
                    throw new InvalidOperationException("Bu öğrencinin proje başvuruları bulunmaktadır. Önce başvuruları silmelisiniz.");
                }
            }

            _context.Users.Remove(user);
            await _context.SaveChangesAsync();
            
            return true;
        }

        public async Task<UserDto> ToggleUserStatusAsync(int userId)
        {
            var user = await _context.Users.FindAsync(userId);
            
            if (user == null)
            {
                throw new InvalidOperationException("Kullanıcı bulunamadı.");
            }

            // Prevent toggling admin users
            if (user.Role == UserRole.Admin)
            {
                throw new InvalidOperationException("Admin kullanıcılarının durumu değiştirilemez.");
            }

            user.IsActive = !user.IsActive;
            await _context.SaveChangesAsync();

            return _mapper.Map<UserDto>(user);
        }

        public async Task<IEnumerable<UserDto>> GetStudentsAsync()
        {
            var students = await _context.Users
                .Where(u => u.Role == UserRole.Student)
                .OrderBy(u => u.FirstName)
                .ThenBy(u => u.LastName)
                .ToListAsync();

            return students.Select(u => _mapper.Map<UserDto>(u)).ToList();
        }

        public async Task<IEnumerable<UserDto>> GetTeachersAsync()
        {
            var teachers = await _context.Users
                .Where(u => u.Role == UserRole.Teacher)
                .OrderBy(u => u.FirstName)
                .ThenBy(u => u.LastName)
                .ToListAsync();

            return teachers.Select(u => _mapper.Map<UserDto>(u)).ToList();
        }

        public async Task<IEnumerable<ProjectDto>> GetProjectsAsync()
        {
            var projects = await _context.Projects
                .Include(p => p.Teacher)
                .OrderByDescending(p => p.CreatedAt)
                .ToListAsync();

            return projects.Select(p => _mapper.Map<ProjectDto>(p)).ToList();
        }

        public async Task<UserDto> UpdateUserAsync(int userId, UpdateUserDto dto)
{
    var user = await _context.Users.FindAsync(userId);
    
    if (user == null)
    {
        throw new InvalidOperationException("Kullanıcı bulunamadı.");
    }

    if (user.Role == UserRole.Admin)
    {
        throw new InvalidOperationException("Admin kullanıcıları düzenlenemez.");
    }

    // Email kontrolü
    if (user.Email != dto.Email)
    {
        var emailExists = await _context.Users.AnyAsync(u => u.Email == dto.Email && u.Id != userId);
        if (emailExists)
        {
            throw new InvalidOperationException("Bu e-posta adresi başka bir kullanıcı tarafından kullanılıyor.");
        }
        user.Email = dto.Email;
    }

    // Temel bilgileri güncelle
    user.FirstName = dto.FirstName;
    user.LastName = dto.LastName;

    // Öğrenci ise
    if (user.Role == UserRole.Student)
    {
        if (!string.IsNullOrEmpty(dto.StudentNumber) && user.StudentNumber != dto.StudentNumber)
        {
            var numberExists = await _context.Users.AnyAsync(u => u.StudentNumber == dto.StudentNumber && u.Id != userId);
            if (numberExists)
            {
                throw new InvalidOperationException("Bu öğrenci numarası başka bir kullanıcı tarafından kullanılıyor.");
            }
            user.StudentNumber = dto.StudentNumber;
        }
        
        if (!string.IsNullOrEmpty(dto.CourseCode))
        {
            user.CourseCode = dto.CourseCode;
        }
    }

    // Öğretmen ise
    if (user.Role == UserRole.Teacher)
    {
        if (dto.TotalQuota.HasValue && dto.TotalQuota.Value >= 1 && dto.TotalQuota.Value <= 50)
        {
            user.TotalQuota = dto.TotalQuota.Value;
        }
    }

    // TC Kimlik No güncellemesi
    if (!string.IsNullOrEmpty(dto.SicilNumber) && dto.SicilNumber.Length == 11)
    {
        if (user.SicilNumber != dto.SicilNumber)
        {
            var sicilExists = await _context.Users.AnyAsync(u => u.SicilNumber == dto.SicilNumber && u.Id != userId);
            if (sicilExists)
            {
                throw new InvalidOperationException("Bu sicil numarası başka bir kullanıcı tarafından kullanılıyor.");
            }
            user.SicilNumber = dto.SicilNumber;
        }
    }

    await _context.SaveChangesAsync();
    
    return _mapper.Map<UserDto>(user);
}
  public async Task<ProjectDto> UpdateProjectAsAdminAsync(int projectId, UpdateProjectDto dto)
{
    var project = await _context.Projects
        .Include(p => p.Teacher)
        .Include(p => p.Applications)
        .FirstOrDefaultAsync(p => p.Id == projectId);

    if (project == null)
        throw new InvalidOperationException("Proje bulunamadı.");

    project.Title = dto.Title;
    project.Description = dto.Description;
    project.Details = dto.Details;
    project.MaxStudents = dto.MaxStudents;
    project.IsActive = dto.IsActive;

    await _context.SaveChangesAsync();

    return _mapper.Map<ProjectDto>(project);
}

public async Task<bool> DeleteProjectAsAdminAsync(int projectId)
{
    var project = await _context.Projects.FindAsync(projectId);
    
    if (project == null)
        return false;

    // Başvuruları da sil (cascade olabilir ama garantiye alalım)
    var applications = await _context.ProjectApplications
        .Where(a => a.ProjectId == projectId)
        .ToListAsync();
    
    _context.ProjectApplications.RemoveRange(applications);
    _context.Projects.Remove(project);
    
    await _context.SaveChangesAsync();
    return true;
}

public async Task<bool> ReviewApplicationAsAdminAsync(int applicationId, ApplicationStatus status, string? reviewNotes)
{
    var application = await _context.ProjectApplications
        .Include(a => a.Project)
        .FirstOrDefaultAsync(a => a.Id == applicationId);

    if (application == null)
        return false;

    // Onaylama için kontenjan kontrolü
    if (status == ApplicationStatus.Approved)
    {
        var currentApproved = await _context.ProjectApplications
            .CountAsync(a => a.ProjectId == application.ProjectId && 
                           a.Status == ApplicationStatus.Approved);

        if (currentApproved >= application.Project.MaxStudents)
        {
            throw new InvalidOperationException("Proje kontenjanı doldu.");
        }
    }

    application.Status = status;
    application.ReviewedAt = DateTime.UtcNow;
    application.ReviewNotes = reviewNotes;

    await _context.SaveChangesAsync();

    return true;
}







    }
}