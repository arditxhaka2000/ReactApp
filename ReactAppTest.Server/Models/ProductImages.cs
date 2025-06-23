using System.ComponentModel.DataAnnotations;

namespace ReactAppTest.Server.Models
{
    public class ProductImages
    {
        public int Id { get; set; }

        public int ProductId { get; set; }
        public Products Product { get; set; }

        [Required]
        [MaxLength(500)]
        public string ImageUrl { get; set; }

        [MaxLength(100)]
        public string? AltText { get; set; }

        public int SortOrder { get; set; } = 0;
        public bool IsPrimary { get; set; } = false;
    }
}
