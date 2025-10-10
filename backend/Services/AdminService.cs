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
            var totalProjects = await _context.Projects.CountAsync(p => p.IsActive);
            var totalApplications = await _context.ProjectApplications.CountAsync();
            var pendingApplications = await _context.ProjectApplications.CountAsync(pa => pa.Status == ApplicationStatus.Pending);
            var approvedApplications = await _context.ProjectApplications.CountAsync(pa => pa.Status == ApplicationStatus.Approved);

            return new Dictionary<string, object>
            {
                { "TotalStudents", totalStudents },
                { "TotalTeachers", totalTeachers },
                { "TotalProjects", totalProjects },
                { "TotalApplications", totalApplications },
                { "PendingApplications", pendingApplications },
                { "ApprovedApplications", approvedApplications }
            };
        }

        public async Task<UserDto> AddStudentAsync(CreateStudentDto studentDto)
        {
            // Check if user with email already exists
            if (await _context.Users.AnyAsync(u => u.Email == studentDto.Email))
            {
                throw new InvalidOperationException("Bu email ile kayıtlı kullanıcı zaten mevcut.");
            }

            // Check if TC number already exists
            if (await _context.Users.AnyAsync(u => u.TcIdentityNumber == studentDto.TcIdentityNumber))
            {
                throw new InvalidOperationException("Bu TC kimlik numarası ile kayıtlı kullanıcı zaten mevcut.");
            }

            // Check if school number already exists
            if (await _context.Users.AnyAsync(u => u.SchoolNumber == studentDto.SchoolNumber))
            {
                throw new InvalidOperationException("Bu okul numarası ile kayıtlı öğrenci zaten mevcut.");
            }

            // Generate username (school number) and password (first 8 digits of TC number)
            var username = studentDto.SchoolNumber;
            var password = studentDto.TcIdentityNumber.Substring(0, 8);

            var user = new User
            {
                FirstName = studentDto.FirstName,
                LastName = studentDto.LastName,
                Email = studentDto.Email,
                PasswordHash = BCrypt.Net.BCrypt.HashPassword(password),
                Role = UserRole.Student,
                TcIdentityNumber = studentDto.TcIdentityNumber,
                SchoolNumber = studentDto.SchoolNumber,
                StudentNumber = studentDto.SchoolNumber, // Using school number as student number
                CourseCode = studentDto.CourseCode,
                CreatedAt = DateTime.UtcNow,
                IsActive = true
            };

            _context.Users.Add(user);
            await _context.SaveChangesAsync();

            return _mapper.Map<UserDto>(user);
        }

        public async Task<UserDto> AddTeacherAsync(CreateTeacherDto teacherDto)
        {
            // Check if user with email already exists
            if (await _context.Users.AnyAsync(u => u.Email == teacherDto.Email))
            {
                throw new InvalidOperationException("Bu email ile kayıtlı kullanıcı zaten mevcut.");
            }

            // Check if TC number already exists
            if (await _context.Users.AnyAsync(u => u.TcIdentityNumber == teacherDto.TcIdentityNumber))
            {
                throw new InvalidOperationException("Bu TC kimlik numarası ile kayıtlı kullanıcı zaten mevcut.");
            }

            // Generate username (email prefix) and password (first 8 digits of TC number)
            var username = teacherDto.Email.Split('@')[0];
            var password = teacherDto.TcIdentityNumber.Substring(0, 8);

            var user = new User
            {
                FirstName = teacherDto.FirstName,
                LastName = teacherDto.LastName,
                Email = teacherDto.Email,
                PasswordHash = BCrypt.Net.BCrypt.HashPassword(password),
                Role = UserRole.Teacher,
                TcIdentityNumber = teacherDto.TcIdentityNumber,
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

            var users = new List<User>();
            ExcelPackage.LicenseContext = LicenseContext.NonCommercial;

            using (var stream = new MemoryStream())
            {
                await excelFile.CopyToAsync(stream);
                using (var package = new ExcelPackage(stream))
                {
                    var worksheet = package.Workbook.Worksheets[0];
                    var rowCount = worksheet.Dimension.Rows;

                    for (int row = 2; row <= rowCount; row++) // Start from row 2 (skip header)
                    {
                        if (userType == UserRole.Student)
                        {
                            var firstName = worksheet.Cells[row, 1].Value?.ToString()?.Trim();
                            var lastName = worksheet.Cells[row, 2].Value?.ToString()?.Trim();
                            var email = worksheet.Cells[row, 3].Value?.ToString()?.Trim();
                            var tcNumber = worksheet.Cells[row, 4].Value?.ToString()?.Trim();
                            var schoolNumber = worksheet.Cells[row, 5].Value?.ToString()?.Trim();
                            var courseCode = worksheet.Cells[row, 6].Value?.ToString()?.Trim();

                            if (string.IsNullOrEmpty(firstName) || string.IsNullOrEmpty(lastName) || 
                                string.IsNullOrEmpty(email) || string.IsNullOrEmpty(tcNumber) || 
                                string.IsNullOrEmpty(schoolNumber))
                            {
                                continue; // Skip invalid rows
                            }

                            // Check duplicates
                            if (await _context.Users.AnyAsync(u => u.Email == email || 
                                u.TcIdentityNumber == tcNumber || u.SchoolNumber == schoolNumber))
                            {
                                continue; // Skip duplicates
                            }

                            var password = tcNumber.Substring(0, 8);
                            var user = new User
                            {
                                FirstName = firstName,
                                LastName = lastName,
                                Email = email,
                                PasswordHash = BCrypt.Net.BCrypt.HashPassword(password),
                                Role = UserRole.Student,
                                TcIdentityNumber = tcNumber,
                                SchoolNumber = schoolNumber,
                                StudentNumber = schoolNumber,
                                CourseCode = courseCode,
                                CreatedAt = DateTime.UtcNow,
                                IsActive = true
                            };
                            users.Add(user);
                        }
                        else if (userType == UserRole.Teacher)
                        {
                            var firstName = worksheet.Cells[row, 1].Value?.ToString()?.Trim();
                            var lastName = worksheet.Cells[row, 2].Value?.ToString()?.Trim();
                            var email = worksheet.Cells[row, 3].Value?.ToString()?.Trim();
                            var tcNumber = worksheet.Cells[row, 4].Value?.ToString()?.Trim();

                            if (string.IsNullOrEmpty(firstName) || string.IsNullOrEmpty(lastName) || 
                                string.IsNullOrEmpty(email) || string.IsNullOrEmpty(tcNumber))
                            {
                                continue; // Skip invalid rows
                            }

                            // Check duplicates
                            if (await _context.Users.AnyAsync(u => u.Email == email || u.TcIdentityNumber == tcNumber))
                            {
                                continue; // Skip duplicates
                            }

                            var password = tcNumber.Substring(0, 8);
                            var user = new User
                            {
                                FirstName = firstName,
                                LastName = lastName,
                                Email = email,
                                PasswordHash = BCrypt.Net.BCrypt.HashPassword(password),
                                Role = UserRole.Teacher,
                                TcIdentityNumber = tcNumber,
                                CreatedAt = DateTime.UtcNow,
                                IsActive = true
                            };
                            users.Add(user);
                        }
                    }
                }
            }

            if (users.Any())
            {
                _context.Users.AddRange(users);
                await _context.SaveChangesAsync();
            }

            return users.Select(u => _mapper.Map<UserDto>(u)).ToList();
        }
    }
}