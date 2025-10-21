namespace GraduationProjectManagement.DTOs
{
    public class NotificationDto
    {
        public int Id { get; set; }
        public int UserId { get; set; }
        public int Type { get; set; }
        public string TypeText { get; set; } = string.Empty;
        public string Title { get; set; } = string.Empty;
        public string Message { get; set; } = string.Empty;
        public int? RelatedProjectId { get; set; }
        public string? RelatedProjectTitle { get; set; }
        public int? RelatedApplicationId { get; set; }
        public bool IsRead { get; set; }
        public bool IsEmailSent { get; set; }
        public DateTime CreatedAt { get; set; }
        public DateTime? ReadAt { get; set; }
    }
}