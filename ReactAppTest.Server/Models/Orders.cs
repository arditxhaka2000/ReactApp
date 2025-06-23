using System.ComponentModel.DataAnnotations;
using System.ComponentModel.DataAnnotations.Schema;

namespace ReactAppTest.Server.Models
{
    public class Orders
    {
        public int Id { get; set; }

        [Required]
        public string OrderNumber { get; set; } // Unique order identifier

        public int UserId { get; set; }
        public Users User { get; set; }

        [Column(TypeName = "decimal(18,2)")]
        public decimal SubTotal { get; set; }

        [Column(TypeName = "decimal(18,2)")]
        public decimal ShippingCost { get; set; }

        [Column(TypeName = "decimal(18,2)")]
        public decimal Tax { get; set; }

        [Column(TypeName = "decimal(18,2)")]
        public decimal Discount { get; set; }

        [Column(TypeName = "decimal(18,2)")]
        public decimal TotalAmount { get; set; }

        [Required]
        [MaxLength(20)]
        public string Status { get; set; } // Pending, Processing, Shipped, Delivered, Cancelled

        [MaxLength(50)]
        public string? PaymentMethod { get; set; }

        [MaxLength(20)]
        public string? PaymentStatus { get; set; } // Pending, Paid, Failed, Refunded

        public DateTime OrderDate { get; set; } = DateTime.UtcNow;
        public DateTime? ShippedDate { get; set; }
        public DateTime? DeliveredDate { get; set; }

        // Shipping Address (copied at time of order)
        [MaxLength(100)]
        public string ShippingFirstName { get; set; }

        [MaxLength(100)]
        public string ShippingLastName { get; set; }

        [MaxLength(100)]
        public string ShippingAddressLine1 { get; set; }

        [MaxLength(100)]
        public string? ShippingAddressLine2 { get; set; }

        [MaxLength(50)]
        public string ShippingCity { get; set; }

        [MaxLength(50)]
        public string? ShippingState { get; set; }

        [MaxLength(20)]
        public string ShippingPostalCode { get; set; }

        [MaxLength(50)]
        public string ShippingCountry { get; set; }

        [MaxLength(20)]
        public string? ShippingPhone { get; set; }

        [MaxLength(500)]
        public string? Notes { get; set; }

        [MaxLength(100)]
        public string? TrackingNumber { get; set; }

        // Navigation properties
        public ICollection<OrderItems> OrderItems { get; set; } = new List<OrderItems>();
    }
}
