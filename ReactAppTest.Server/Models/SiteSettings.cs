using System.ComponentModel.DataAnnotations;

namespace ReactAppTest.Server.Models
{
    public class SiteSettings
    {
        public int Id { get; set; }

        [Required]
        [MaxLength(100)]
        public string Key { get; set; }

        [MaxLength(1000)]
        public string Value { get; set; }

        [MaxLength(200)]
        public string? Description { get; set; }

        [MaxLength(50)]
        public string? Category { get; set; } // Shipping, Payment, General, etc.
    }
}
