namespace ReactAppTest.Server.Models
{
    public class WishlistItems
    {
        public int Id { get; set; }

        public int UserId { get; set; }
        public Users User { get; set; }

        public int ProductId { get; set; }
        public Products Product { get; set; }

        public DateTime AddedAt { get; set; } = DateTime.UtcNow;
    }
}
