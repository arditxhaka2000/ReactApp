using Microsoft.EntityFrameworkCore;
using System.Collections.Generic;
using System.ComponentModel.DataAnnotations;
using System.ComponentModel.DataAnnotations.Schema;

namespace ReactAppTest.Server.Models
{
    public class Products
    {
        public int Id { get; set; }

        [Required]
        [MaxLength(200)]
        public string Name { get; set; }

        [Required]
        [Column(TypeName = "decimal(18,2)")]
        public decimal Price { get; set; }

        [Column(TypeName = "decimal(18,2)")]
        public decimal? OriginalPrice { get; set; } // For sale/discount pricing

        [MaxLength(100)]
        public string Brand { get; set; }

        public bool InStock { get; set; }

        [MaxLength(2000)]
        public string? Description { get; set; }

        [MaxLength(500)]
        public string? ImageUrl { get; set; }

        public int CategoryId { get; set; }
        public Categories Category { get; set; }

        public int? CollectionId { get; set; }
        public Collections? Collection { get; set; }

        [MaxLength(50)]
        public string? Color { get; set; }

        [MaxLength(100)]
        public string? Material { get; set; }

        [MaxLength(100)]
        public string? CareInstructions { get; set; }

        [MaxLength(50)]
        public string? Fit { get; set; } // e.g., "True to size", "Size up", "Size down"

        public bool IsFeatured { get; set; }
        public bool IsNewArrival { get; set; }
        public bool IsOnSale { get; set; }

        public DateTime CreatedAt { get; set; } = DateTime.UtcNow;
        public DateTime UpdatedAt { get; set; } = DateTime.UtcNow;

        // Navigation properties
        public ICollection<ProductImages> ProductImages { get; set; } = new List<ProductImages>();
        public ICollection<ProductSizes> ProductSizes { get; set; } = new List<ProductSizes>();
        public ICollection<ProductReviews> ProductReviews { get; set; } = new List<ProductReviews>();
        public ICollection<CartItems> CartItems { get; set; } = new List<CartItems>();
        public ICollection<OrderItems> OrderItems { get; set; } = new List<OrderItems>();
        public ICollection<WishlistItems> WishlistItems { get; set; } = new List<WishlistItems>();
        public ICollection<ProductTags> ProductTags { get; set; } = new List<ProductTags>();
    }

}
