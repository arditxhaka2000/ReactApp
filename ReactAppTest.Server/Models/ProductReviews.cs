using System.ComponentModel.DataAnnotations;

namespace ReactAppTest.Server.Models
{
    public class ProductReviews
    {
        public int Id { get; set; }

        public int ProductId { get; set; }
        public Products Product { get; set; }

        public int UserId { get; set; }
        public Users User { get; set; }

        [Range(1, 5)]
        public int Rating { get; set; }

        [MaxLength(100)]
        public string? Title { get; set; }

        [MaxLength(1000)]
        public string? Comment { get; set; }

        public bool IsVerifiedPurchase { get; set; }
        public bool IsApproved { get; set; } = false;

        public DateTime CreatedAt { get; set; } = DateTime.UtcNow;

        // Helpful votes
        public int HelpfulVotes { get; set; } = 0;
    }
}
