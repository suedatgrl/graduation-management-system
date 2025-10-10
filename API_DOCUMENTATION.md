# API Documentation - New Endpoints

## Authentication & Password Management

### Forgot Password
Request a password reset token via email.

**Endpoint:** `POST /api/auth/forgot-password`

**Request Body:**
```json
{
  "email": "user@example.com"
}
```

**Response (200 OK):**
```json
{
  "message": "If the email exists, a password reset link has been sent."
}
```

**Notes:**
- Returns success even if email doesn't exist (security best practice)
- Reset token valid for 1 hour
- In development, token is logged to console

---

### Reset Password
Reset password using the token received via email.

**Endpoint:** `POST /api/auth/reset-password`

**Request Body:**
```json
{
  "email": "user@example.com",
  "token": "guid-token-from-email",
  "newPassword": "newSecurePassword123"
}
```

**Response (200 OK):**
```json
{
  "message": "Password has been reset successfully."
}
```

**Response (400 Bad Request):**
```json
{
  "message": "Invalid or expired reset token."
}
```

**Validation:**
- `email`: Required, must be valid email address
- `token`: Required
- `newPassword`: Required, minimum 6 characters

---

### Change Password (Authenticated)
Change password for the currently logged-in user.

**Endpoint:** `POST /api/user/change-password`

**Authorization:** Bearer Token Required

**Request Body:**
```json
{
  "currentPassword": "oldPassword123",
  "newPassword": "newSecurePassword123"
}
```

**Response (200 OK):**
```json
{
  "message": "Password changed successfully"
}
```

**Response (400 Bad Request):**
```json
{
  "message": "Current password is incorrect"
}
```

**Validation:**
- `currentPassword`: Required
- `newPassword`: Required, minimum 6 characters

---

## Projects

### Get All Projects (Updated)
Retrieve all active projects with optional filtering.

**Endpoint:** `GET /api/projects`

**Query Parameters:**
- `department` (optional): Filter by department (1=Turkish, 2=English)
- `courseCode` (optional): Filter by course code ("BLM" or "COM")

**Examples:**
```
GET /api/projects
GET /api/projects?department=1
GET /api/projects?courseCode=BLM
GET /api/projects?department=1&courseCode=BLM
```

**Response (200 OK):**
```json
[
  {
    "id": 1,
    "title": "Project Title",
    "description": "Project Description",
    "department": 1,
    "courseCode": "BLM",
    "maxStudents": 3,
    "currentStudents": 0,
    "requirements": "Requirements",
    "keywords": "keywords",
    "isActive": true,
    "teacher": {
      "id": 2,
      "firstName": "John",
      "lastName": "Doe",
      "email": "john@example.com",
      "role": 2
    },
    "createdAt": "2024-10-10T12:00:00Z"
  }
]
```

---

## Admin Endpoints

### Create Student (Updated)
Create a new student account.

**Endpoint:** `POST /api/admin/students`

**Authorization:** Admin role required

**Request Body:**
```json
{
  "firstName": "Jane",
  "lastName": "Smith",
  "email": "jane.smith@student.edu",
  "tcIdentityNumber": "12345678901",
  "schoolNumber": "2021123456",
  "courseCode": "BLM"
}
```

**Validation:**
- `courseCode`: Required, must be "BLM" (Turkish) or "COM" (English)
- All other fields: Required with specific format/length constraints

**Response (200 OK):**
```json
{
  "id": 3,
  "firstName": "Jane",
  "lastName": "Smith",
  "email": "jane.smith@student.edu",
  "role": 1,
  "schoolNumber": "2021123456",
  "tcIdentityNumber": "12345678901",
  "courseCode": "BLM"
}
```

---

### Create Teacher (Updated)
Create a new teacher account.

**Endpoint:** `POST /api/admin/teachers`

**Authorization:** Admin role required

**Request Body:**
```json
{
  "firstName": "John",
  "lastName": "Doe",
  "email": "john.doe@university.edu",
  "tcIdentityNumber": "98765432109"
}
```

**Note:** `department` and `title` fields have been removed

**Response (200 OK):**
```json
{
  "id": 2,
  "firstName": "John",
  "lastName": "Doe",
  "email": "john.doe@university.edu",
  "role": 2,
  "tcIdentityNumber": "98765432109"
}
```

---

### Create Project (Updated)
Create a new project.

**Endpoint:** `POST /api/projects`

**Authorization:** Teacher role required

**Request Body:**
```json
{
  "title": "Advanced AI Research",
  "description": "Research on machine learning algorithms",
  "department": 2,
  "courseCode": "COM",
  "maxStudents": 3,
  "requirements": "Strong programming skills",
  "keywords": "AI, ML, Python"
}
```

**Validation:**
- `courseCode`: Optional, must be "BLM" or "COM" if provided

**Response (200 OK):**
```json
{
  "id": 5,
  "title": "Advanced AI Research",
  "description": "Research on machine learning algorithms",
  "department": 2,
  "courseCode": "COM",
  "maxStudents": 3,
  "currentStudents": 0,
  "requirements": "Strong programming skills",
  "keywords": "AI, ML, Python",
  "isActive": true,
  "teacher": {
    "id": 2,
    "firstName": "John",
    "lastName": "Doe",
    "email": "john.doe@university.edu",
    "role": 2
  },
  "createdAt": "2024-10-10T12:00:00Z"
}
```

---

## Course Code Reference

- **BLM**: Turkish language courses (Bilgisayar Mühendisliği)
- **COM**: English language courses (Computer Engineering)

## Department Enum

- **1**: Turkish
- **2**: English

## User Roles

- **1**: Student
- **2**: Teacher
- **3**: Admin
