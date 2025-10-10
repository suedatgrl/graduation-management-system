# Changes Summary

## Overview
This update implements comprehensive changes to the User and Project models, adds password reset functionality, and implements course code filtering for language-based course selection (BLM for Turkish, COM for English).

## Model Changes

### User Model (`backend/Models/User.cs`)
- **Removed:**
  - `Title` field (previously for teachers)
  - `Department` field
  
- **Added:**
  - `CourseCode` field (string, nullable) - For students to specify BLM or COM
  - `PasswordResetToken` field (string, nullable)
  - `PasswordResetTokenExpiry` field (DateTime, nullable)

### Project Model (`backend/Models/Project.cs`)
- **Added:**
  - `CourseCode` field (string, nullable) - For language-based filtering

## DTO Changes

### CreateStudentDto (`backend/DTOs/AdminDtTOs.cs`)
- **Removed:** `Department` (optional string)
- **Added:** `CourseCode` (required string with validation for "BLM" or "COM")

### CreateTeacherDto (`backend/DTOs/AdminDtTOs.cs`)
- **Removed:** 
  - `Department` field
  - `Title` field

### UserDto (`backend/DTOs/AuthDTOs.cs`)
- **Removed:** 
  - `Department` field
  - `Title` field
- **Added:** `CourseCode` field

### RegisterRequestDto (`backend/DTOs/AuthDTOs.cs`)
- **Removed:** 
  - `Department` field
  - `Title` field
- **Added:** `CourseCode` field

### New DTOs in AuthDTOs.cs
- **ForgotPasswordDto:** For requesting password reset
  - `Email` (required, EmailAddress)
  
- **ResetPasswordDto:** For resetting password with token
  - `Email` (required, EmailAddress)
  - `Token` (required)
  - `NewPassword` (required, min length 6)
  
- **ChangePasswordDto:** For changing password when logged in
  - `CurrentPassword` (required)
  - `NewPassword` (required, min length 6)

### ProjectDTOs (`backend/DTOs/ProjectDTOs.cs`)
- **ProjectDto:** Added `CourseCode` field
- **CreateProjectDto:** Added `CourseCode` field with validation for "BLM" or "COM"

## Service Changes

### AdminService (`backend/Services/AdminService.cs`)
- Updated `AddStudentAsync` to use `CourseCode` instead of `Department`
- Updated `AddTeacherAsync` to remove `Department` and `Title` fields
- Updated bulk upload for students to use `CourseCode` from column 6
- Updated bulk upload for teachers to remove `Department` and `Title` processing

### AuthService (`backend/Services/AuthService.cs`)
- **Added dependency:** `IEmailService` for sending password reset emails
- **New methods:**
  - `ForgotPasswordAsync`: Generates reset token and sends email
  - `ResetPasswordAsync`: Validates token and resets password
  - `ChangePasswordAsync`: Allows authenticated users to change password

### ProjectService (`backend/Services/ProjectService.cs`)
- Updated `GetAllProjectsAsync` to accept optional `courseCode` parameter for filtering

### New Services
- **IEmailService** (`backend/Services/IEmailService.cs`): Interface for email service
- **EmailService** (`backend/Services/EmailService.cs`): Implementation with logging (production email sending commented out for now)

## Controller Changes

### AuthController (`backend/Controller/AuthController.cs`)
- **New endpoints:**
  - `POST /api/auth/forgot-password`: Request password reset
  - `POST /api/auth/reset-password`: Reset password with token

### ProjectsController (`backend/Controller/ProjectsController.cs`)
- Updated `GET /api/projects` to accept optional `courseCode` query parameter

### New Controller
- **UserController** (`backend/Controller/UserController.cs`)
  - `POST /api/user/change-password`: Change password for authenticated users

## Database Migration

Created migration: `20251010192937_UpdateUserAndProjectModels.cs`
- Renames `Users.Title` to `Users.PasswordResetToken`
- Renames `Users.Department` to `Users.CourseCode`
- Adds `Users.PasswordResetTokenExpiry` (timestamp with time zone, nullable)
- Adds `Projects.CourseCode` (text, nullable)

## Configuration Changes

### Program.cs (`backend/Program.cs`)
- Registered `IEmailService` -> `EmailService` in dependency injection

## Infrastructure

### .gitignore
- Added comprehensive .gitignore to exclude build artifacts, binaries, and temporary files

## API Endpoints Summary

### New Endpoints
1. `POST /api/auth/forgot-password` - Request password reset
2. `POST /api/auth/reset-password` - Reset password with token
3. `POST /api/user/change-password` - Change password (authenticated)

### Modified Endpoints
1. `GET /api/projects?department=X&courseCode=Y` - Now supports courseCode filtering

## Validation Rules

### CourseCode Validation
- Must be either "BLM" (Turkish) or "COM" (English)
- Applied to:
  - `CreateStudentDto.CourseCode` (required)
  - `CreateProjectDto.CourseCode` (optional)

## Security Features

1. **Password Reset Flow:**
   - Token-based with 1-hour expiry
   - Doesn't reveal if email exists or not
   - Token stored hashed in database

2. **Change Password:**
   - Requires current password verification
   - Only for authenticated users
   - Minimum 6 characters for new password

## Testing Notes

- All changes compile successfully
- Migration generated correctly
- Build completed with 0 warnings and 0 errors

## Future Enhancements

1. Implement actual email sending in `EmailService` (currently logs to console)
2. Add SMTP configuration in appsettings.json
3. Add password strength requirements
4. Add rate limiting for password reset requests
