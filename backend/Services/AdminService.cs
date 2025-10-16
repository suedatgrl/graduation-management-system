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
                { "rejectedApplications", rejectedApplications }
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
            if (await _context.Users.AnyAsync(u => u.StudentNumber == studentDto.StudentNumber))
            {
                throw new InvalidOperationException("Bu okul numarası ile kayıtlı öğrenci zaten mevcut.");
            }

            // Generate username (school number) and password (first 8 digits of TC number)
            var username = studentDto.StudentNumber;
            var password = studentDto.TcIdentityNumber.Substring(0, 8);

            var user = new User
            {
                FirstName = studentDto.FirstName,
                LastName = studentDto.LastName,
                Email = studentDto.Email,
                PasswordHash = BCrypt.Net.BCrypt.HashPassword(password),
                Role = UserRole.Student,
                TcIdentityNumber = studentDto.TcIdentityNumber,
                StudentNumber = studentDto.StudentNumber, // Using school number as student number
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
            // Validation checks
            if (await _context.Users.AnyAsync(u => u.Email == teacherDto.Email))
            {
                throw new InvalidOperationException("Bu email ile kayıtlı kullanıcı zaten mevcut.");
            }

            if (await _context.Users.AnyAsync(u => u.TcIdentityNumber == teacherDto.TcIdentityNumber))
            {
                throw new InvalidOperationException("Bu TC kimlik numarası ile kayıtlı kullanıcı zaten mevcut.");
            }

            // Validate TC number length
            if (string.IsNullOrEmpty(teacherDto.TcIdentityNumber) || teacherDto.TcIdentityNumber.Length < 8)
            {
                throw new InvalidOperationException("Geçersiz TC kimlik numarası.");
            }

            // Generate password (first 8 digits of TC number)
            var password = teacherDto.TcIdentityNumber.Substring(0, 8);

            var user = new User
            {
                FirstName = teacherDto.FirstName,
                LastName = teacherDto.LastName,
                Email = teacherDto.Email,
                PasswordHash = BCrypt.Net.BCrypt.HashPassword(password),
                Role = UserRole.Teacher,
                TcIdentityNumber = teacherDto.TcIdentityNumber,
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
                                var tcNumber = worksheet.Cells[row, 4].Value?.ToString()?.Trim();
                                var studentNumber = worksheet.Cells[row, 5].Value?.ToString()?.Trim();
                                var courseCode = worksheet.Cells[row, 6].Value?.ToString()?.Trim();

                                // Validate required fields
                                if (string.IsNullOrEmpty(firstName) || string.IsNullOrEmpty(lastName) || 
                                    string.IsNullOrEmpty(email) || string.IsNullOrEmpty(tcNumber) || 
                                    string.IsNullOrEmpty(studentNumber))
                                {
                                    errorMessages.Add($"Satır {row}: Eksik bilgi");
                                    continue;
                                }

                                // Validate TC number
                                if (tcNumber.Length != 11 || !tcNumber.All(char.IsDigit))
                                {
                                    errorMessages.Add($"Satır {row}: Geçersiz TC kimlik numarası");
                                    continue;
                                }

                                // Check duplicates in database
                                if (await _context.Users.AnyAsync(u => u.Email == email))
                                {
                                    errorMessages.Add($"Satır {row}: Email zaten kayıtlı - {email}");
                                    continue;
                                }

                                if (await _context.Users.AnyAsync(u => u.TcIdentityNumber == tcNumber))
                                {
                                    errorMessages.Add($"Satır {row}: TC kimlik numarası zaten kayıtlı");
                                    continue;
                                }

                                if (await _context.Users.AnyAsync(u => u.StudentNumber == studentNumber))
                                {
                                    errorMessages.Add($"Satır {row}: Öğrenci numarası zaten kayıtlı - {studentNumber}");
                                    continue;
                                }

                                // Check duplicates in current batch
                                if (users.Any(u => u.Email == email || u.TcIdentityNumber == tcNumber || u.StudentNumber == studentNumber))
                                {
                                    errorMessages.Add($"Satır {row}: Excel içinde tekrarlanan bilgi");
                                    continue;
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
                                    StudentNumber = studentNumber,
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
                                var totalQuotaStr = worksheet.Cells[row, 5].Value?.ToString()?.Trim();

                                // Validate required fields
                                if (string.IsNullOrEmpty(firstName) || string.IsNullOrEmpty(lastName) || 
                                    string.IsNullOrEmpty(email) || string.IsNullOrEmpty(tcNumber))
                                {
                                    errorMessages.Add($"Satır {row}: Eksik bilgi");
                                    continue;
                                }

                                // Validate TC number
                                if (tcNumber.Length != 11 || !tcNumber.All(char.IsDigit))
                                {
                                    errorMessages.Add($"Satır {row}: Geçersiz TC kimlik numarası");
                                    continue;
                                }

                                // Check duplicates in database
                                if (await _context.Users.AnyAsync(u => u.Email == email))
                                {
                                    errorMessages.Add($"Satır {row}: Email zaten kayıtlı - {email}");
                                    continue;
                                }

                                if (await _context.Users.AnyAsync(u => u.TcIdentityNumber == tcNumber))
                                {
                                    errorMessages.Add($"Satır {row}: TC kimlik numarası zaten kayıtlı");
                                    continue;
                                }

                                // Check duplicates in current batch
                                if (users.Any(u => u.Email == email || u.TcIdentityNumber == tcNumber))
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

                                var password = tcNumber.Substring(0, 8);
                                var user = new User
                                {
                                    FirstName = firstName,
                                    LastName = lastName,
                                    Email = email,
                                    PasswordHash = BCrypt.Net.BCrypt.HashPassword(password),
                                    Role = UserRole.Teacher,
                                    TcIdentityNumber = tcNumber,
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
                    throw new InvalidOperationException("Bu öğretmenin projeleri bulunmaktadır. Önce projeleri silmelisiniz.");
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
  


    }
}