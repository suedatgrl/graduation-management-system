namespace GraduationProjectManagement.DTOs
{
    public class ProjectApplicationDto
    {
        public int Id { get; set; }
        public int ProjectId { get; set; }
        public string ProjectTitle { get; set; } = string.Empty;
        public int StudentId { get; set; }
        public string StudentName { get; set; } = string.Empty;
        public string StudentEmail { get; set; } = string.Empty;
        public string? StudentNumber { get; set; }
        public int Status { get; set; }
        public string StatusText { get; set; } = string.Empty;
        public DateTime AppliedAt { get; set; }
        public DateTime? ReviewedAt { get; set; }
        public string? ReviewNotes { get; set; }
    }
}