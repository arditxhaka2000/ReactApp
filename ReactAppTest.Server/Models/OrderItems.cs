using System.ComponentModel.DataAnnotations;
using System.ComponentModel.DataAnnotations.Schema;

namespace ReactAppTest.Server.Models
{
    public class OrderItems
    {
        public int Id { get; set; }

        public int OrderId { get; set; }
        public Orders Order { get; set; }

        public int ProductId { get; set; }
        public Products Product { get; set; }

        public int SizeId { get; set; }
        public Sizes Size { get; set; }

        public int Quantity { get; set; }

        [Column(TypeName = "decimal(18,2)")]
        public decimal UnitPrice { get; set; } // Price at time of order

        [Column(TypeName = "decimal(18,2)")]
        public decimal TotalPrice { get; set; }

        // Store product details at time of order (in case product is modified/deleted)
        [MaxLength(200)]
        public string ProductName { get; set; }

        [MaxLength(50)]
        public string? ProductColor { get; set; }

        [MaxLength(10)]
        public string SizeName { get; set; }
    }

}
