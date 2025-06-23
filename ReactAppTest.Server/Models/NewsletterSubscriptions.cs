using System.ComponentModel.DataAnnotations;

namespace ReactAppTest.Server.Models
{
    public class NewsletterSubscriptions
    {
        public int Id { get; set; }

        [Required]
        [MaxLength(255)]
        public string Email { get; set; }

        [MaxLength(50)]
        public string? FirstName { get; set; }

        public bool IsActive { get; set; } = true;
        public DateTime SubscribedAt { get; set; } = DateTime.UtcNow;
        public DateTime? UnsubscribedAt { get; set; }

        [MaxLength(50)]
        public string? Source { get; set; } // Where they subscribed from
    }
}
