using System.ComponentModel.DataAnnotations;

namespace ReactAppTest.Server.Models
{
    public class Users
    {
        public int Id { get; set; }

        [Required]
        [MaxLength(100)]
        public string FirstName { get; set; }

        [Required]
        [MaxLength(100)]
        public string LastName { get; set; }

        [Required]
        [MaxLength(255)]
        public string Email { get; set; }

        [Required]
        [MaxLength(255)]
        public string PasswordHash { get; set; }

        [MaxLength(20)]
        public string? PhoneNumber { get; set; }

        public DateTime DateOfBirth { get; set; }

        [MaxLength(10)]
        public string? Gender { get; set; }

        public DateTime CreatedAt { get; set; } = DateTime.UtcNow;
        public DateTime LastLoginAt { get; set; }

        public bool IsEmailVerified { get; set; }
        public bool IsActive { get; set; } = true;

        // Navigation properties
        public ICollection<UserAddresses> UserAddresses { get; set; } = new List<UserAddresses>();
        public ICollection<Orders> Orders { get; set; } = new List<Orders>();
        public ICollection<ProductReviews> ProductReviews { get; set; } = new List<ProductReviews>();
        public ICollection<WishlistItems> WishlistItems { get; set; } = new List<WishlistItems>();
        public ICollection<CartItems> CartItems { get; set; } = new List<CartItems>();
    }
    public class UserAddresses
    {
        public int Id { get; set; }

        public int UserId { get; set; }
        public Users User { get; set; }

        [Required]
        [MaxLength(100)]
        public string AddressLine1 { get; set; }

        [MaxLength(100)]
        public string? AddressLine2 { get; set; }

        [Required]
        [MaxLength(50)]
        public string City { get; set; }

        [MaxLength(50)]
        public string? State { get; set; }

        [Required]
        [MaxLength(20)]
        public string PostalCode { get; set; }

        [Required]
        [MaxLength(50)]
        public string Country { get; set; }

        public bool IsDefault { get; set; } = false;
        public bool IsBillingAddress { get; set; } = false;
        public bool IsShippingAddress { get; set; } = true;

        [MaxLength(50)]
        public string? AddressType { get; set; } // Home, Work, etc.
    }
}
