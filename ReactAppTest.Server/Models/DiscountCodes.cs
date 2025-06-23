using System.ComponentModel.DataAnnotations;
using System.ComponentModel.DataAnnotations.Schema;

namespace ReactAppTest.Server.Models
{
    public class DiscountCodes
    {
        public int Id { get; set; }

        [Required]
        [MaxLength(50)]
        public string Code { get; set; }

        [MaxLength(100)]
        public string Description { get; set; }

        [MaxLength(20)]
        public string DiscountType { get; set; } // Percentage, FixedAmount

        [Column(TypeName = "decimal(18,2)")]
        public decimal DiscountValue { get; set; }

        [Column(TypeName = "decimal(18,2)")]
        public decimal? MinimumOrderAmount { get; set; }

        [Column(TypeName = "decimal(18,2)")]
        public decimal? MaximumDiscountAmount { get; set; }

        public int? UsageLimit { get; set; }
        public int UsageCount { get; set; } = 0;

        public DateTime StartDate { get; set; }
        public DateTime EndDate { get; set; }

        public bool IsActive { get; set; } = true;
        public bool IsFirstTimeCustomerOnly { get; set; } = false;
    }
}
