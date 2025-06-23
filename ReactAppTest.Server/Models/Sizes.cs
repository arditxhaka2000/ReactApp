using System.ComponentModel.DataAnnotations;
using System.ComponentModel.DataAnnotations.Schema;

namespace ReactAppTest.Server.Models
{
    public class Sizes
    {
        public int Id { get; set; }

        [Required]
        [MaxLength(10)]
        public string Name { get; set; } // UK4, UK6, etc.

        [MaxLength(10)]
        public string? USSize { get; set; }

        [MaxLength(10)]
        public string? EUSize { get; set; }

        [MaxLength(20)]
        public string? Bust { get; set; }

        [MaxLength(20)]
        public string? Waist { get; set; }

        [MaxLength(20)]
        public string? Hips { get; set; }

        public int SortOrder { get; set; }

        public ICollection<ProductSizes> ProductSizes { get; set; } = new List<ProductSizes>();
    }
    public class ProductSizes
    {
        public int Id { get; set; }

        public int ProductId { get; set; }
        public Products Product { get; set; }

        public int SizeId { get; set; }
        public Sizes Size { get; set; }

        public int StockQuantity { get; set; }
        public bool IsInStock { get; set; }

        [Column(TypeName = "decimal(18,2)")]
        public decimal? PriceAdjustment { get; set; } // If different sizes have different prices
    }

}
