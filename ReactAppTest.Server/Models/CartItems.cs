namespace ReactAppTest.Server.Models
{
    public class CartItems
    {
        public int Id { get; set; }

        public int UserId { get; set; }
        public Users User { get; set; }

        public int ProductId { get; set; }
        public Products Product { get; set; }

        public int SizeId { get; set; }
        public Sizes Size { get; set; }

        public int Quantity { get; set; }

        public DateTime AddedAt { get; set; } = DateTime.UtcNow;
        public DateTime UpdatedAt { get; set; } = DateTime.UtcNow;
    }
}
