using System.ComponentModel.DataAnnotations;

namespace ReactAppTest.Server.Models
{
    public class Tags
    {
        public int Id { get; set; }

        [Required]
        [MaxLength(50)]
        public string Name { get; set; }

        [MaxLength(100)]
        public string? Description { get; set; }

        [MaxLength(20)]
        public string? Color { get; set; } // For display styling

        public bool IsActive { get; set; } = true;

        public ICollection<ProductTags> ProductTags { get; set; } = new List<ProductTags>();
    }
    public class ProductTags
    {
        public int ProductId { get; set; }
        public Products Product { get; set; }

        public int TagId { get; set; }
        public Tags Tag { get; set; }
    }
}
