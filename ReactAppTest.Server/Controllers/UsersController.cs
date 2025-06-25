using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;
using ReactAppTest.Server.Models;
using System.Security.Claims;

namespace ReactAppTest.Server.Controllers
{
    [ApiController]
    [Route("api/[controller]")]
    [Authorize]
    public class UsersController : ControllerBase
    {
        private readonly ApplicationDbContext _context;

        public UsersController(ApplicationDbContext context)
        {
            _context = context;
        }

        private int GetCurrentUserId()
        {
            var userIdClaim = User.FindFirst(ClaimTypes.NameIdentifier)?.Value;
            return int.Parse(userIdClaim ?? "0");
        }

        // GET: api/users/profile
        [HttpGet("profile")]
        public async Task<ActionResult<Users>> GetProfile()
        {
            var userId = GetCurrentUserId();
            var user = await _context.Users.FindAsync(userId);

            if (user == null)
            {
                return NotFound();
            }

            return Ok(user);
        }

        // PUT: api/users/profile
        [HttpPut("profile")]
        public async Task<IActionResult> UpdateProfile([FromBody] UpdateProfileRequest request)
        {
            var userId = GetCurrentUserId();
            var user = await _context.Users.FindAsync(userId);

            if (user == null)
            {
                return NotFound();
            }

            user.FirstName = request.FirstName;
            user.LastName = request.LastName;
            user.Email = request.Email;
            user.PhoneNumber = request.PhoneNumber;
            user.DateOfBirth = request.DateOfBirth;
            user.Gender = request.Gender;

            try
            {
                await _context.SaveChangesAsync();
                return Ok(new { success = true, message = "Profile updated successfully" });
            }
            catch (Exception ex)
            {
                return BadRequest(new { success = false, message = "Failed to update profile" });
            }
        }

        // GET: api/users/orders
        [HttpGet("orders")]
        public async Task<ActionResult<IEnumerable<OrderDto>>> GetUserOrders()
        {
            var userId = GetCurrentUserId();

            var orders = await _context.Orders
                .Where(o => o.UserId == userId)
                .Include(o => o.OrderItems)
                .ThenInclude(oi => oi.Product)
                .OrderByDescending(o => o.OrderDate)
                .Select(o => new OrderDto
                {
                    Id = o.Id,
                    OrderNumber = o.OrderNumber,
                    OrderDate = o.OrderDate,
                    Status = o.Status,
                    TotalAmount = o.TotalAmount,
                    ItemCount = o.OrderItems.Count(),
                    ShippingAddress = o.ShippingAddressLine1 + (string.IsNullOrEmpty(o.ShippingAddressLine2) ? "" : ", " + o.ShippingAddressLine2) + ", " + o.ShippingCity + ", " + o.ShippingState + " " + o.ShippingPostalCode + ", " + o.ShippingCountry
                })
                .ToListAsync();

            return Ok(orders);
        }

        // GET: api/users/wishlist
        [HttpGet("wishlist")]
        public async Task<ActionResult<IEnumerable<WishlistDto>>> GetUserWishlist()
        {
            var userId = GetCurrentUserId();

            var wishlistItems = await _context.WishlistItems
                .Where(w => w.UserId == userId)
                .Include(w => w.Product)
                .Select(w => new WishlistDto
                {
                    Id = w.Id,
                    Product = new ProductDto
                    {
                        Id = w.Product.Id,
                        Name = w.Product.Name,
                        Price = w.Product.Price,
                    },
                    AddedAt = w.AddedAt
                })
                .ToListAsync();

            return Ok(wishlistItems);
        }

        // GET: api/users/addresses
        [HttpGet("addresses")]
        public async Task<ActionResult<IEnumerable<UserAddresses>>> GetUserAddresses()
        {
            var userId = GetCurrentUserId();

            var addresses = await _context.UserAddresses
                .Where(a => a.UserId == userId)
                .OrderByDescending(a => a.IsDefault)
                .ToListAsync();

            return Ok(addresses);
        }

        // POST: api/users/addresses
        [HttpPost("addresses")]
        public async Task<ActionResult<UserAddresses>> AddAddress([FromBody] AddAddressRequest request)
        {
            var userId = GetCurrentUserId();

            // If this is set as default, unset other default addresses
            if (request.IsDefault)
            {
                var existingDefaults = await _context.UserAddresses
                    .Where(a => a.UserId == userId && a.IsDefault)
                    .ToListAsync();

                foreach (var addr in existingDefaults)
                {
                    addr.IsDefault = false;
                }
            }

            var address = new UserAddresses
            {
                UserId = userId,
                AddressLine1 = request.AddressLine1,
                AddressLine2 = request.AddressLine2,
                City = request.City,
                State = request.State,
                PostalCode = request.PostalCode,
                Country = request.Country,
                AddressType = request.AddressType,
                IsDefault = request.IsDefault,
                IsBillingAddress = request.IsBillingAddress,
                IsShippingAddress = request.IsShippingAddress
            };

            _context.UserAddresses.Add(address);
            await _context.SaveChangesAsync();

            return CreatedAtAction(nameof(GetUserAddresses), new { id = address.Id }, address);
        }

        // PUT: api/users/addresses/{id}
        [HttpPut("addresses/{id}")]
        public async Task<IActionResult> UpdateAddress(int id, [FromBody] AddAddressRequest request)
        {
            var userId = GetCurrentUserId();
            var address = await _context.UserAddresses
                .FirstOrDefaultAsync(a => a.Id == id && a.UserId == userId);

            if (address == null)
            {
                return NotFound();
            }

            // If this is set as default, unset other default addresses
            if (request.IsDefault && !address.IsDefault)
            {
                var existingDefaults = await _context.UserAddresses
                    .Where(a => a.UserId == userId && a.IsDefault && a.Id != id)
                    .ToListAsync();

                foreach (var addr in existingDefaults)
                {
                    addr.IsDefault = false;
                }
            }

            address.AddressLine1 = request.AddressLine1;
            address.AddressLine2 = request.AddressLine2;
            address.City = request.City;
            address.State = request.State;
            address.PostalCode = request.PostalCode;
            address.Country = request.Country;
            address.AddressType = request.AddressType;
            address.IsDefault = request.IsDefault;
            address.IsBillingAddress = request.IsBillingAddress;
            address.IsShippingAddress = request.IsShippingAddress;

            await _context.SaveChangesAsync();
            return Ok(address);
        }

        // DELETE: api/users/addresses/{id}
        [HttpDelete("addresses/{id}")]
        public async Task<IActionResult> DeleteAddress(int id)
        {
            var userId = GetCurrentUserId();
            var address = await _context.UserAddresses
                .FirstOrDefaultAsync(a => a.Id == id && a.UserId == userId);

            if (address == null)
            {
                return NotFound();
            }

            _context.UserAddresses.Remove(address);
            await _context.SaveChangesAsync();

            return NoContent();
        }

        // POST: api/users/addresses/{id}/set-default
        [HttpPost("addresses/{id}/set-default")]
        public async Task<IActionResult> SetDefaultAddress(int id)
        {
            var userId = GetCurrentUserId();

            // Unset all default addresses for user
            var allAddresses = await _context.UserAddresses
                .Where(a => a.UserId == userId)
                .ToListAsync();

            foreach (var addr in allAddresses)
            {
                addr.IsDefault = addr.Id == id;
            }

            await _context.SaveChangesAsync();
            return Ok();
        }

        // POST: api/users/wishlist/{productId}
        [HttpPost("wishlist/{productId}")]
        public async Task<IActionResult> AddToWishlist(int productId)
        {
            var userId = GetCurrentUserId();

            // Check if already in wishlist
            var existing = await _context.WishlistItems
                .FirstOrDefaultAsync(w => w.UserId == userId && w.ProductId == productId);

            if (existing != null)
            {
                return BadRequest(new { message = "Item already in wishlist" });
            }

            var wishlistItem = new WishlistItems
            {
                UserId = userId,
                ProductId = productId,
                AddedAt = DateTime.UtcNow
            };

            _context.WishlistItems.Add(wishlistItem);
            await _context.SaveChangesAsync();

            return Ok(new { message = "Added to wishlist" });
        }

        // DELETE: api/users/wishlist/{productId}
        [HttpDelete("wishlist/{productId}")]
        public async Task<IActionResult> RemoveFromWishlist(int productId)
        {
            var userId = GetCurrentUserId();

            var wishlistItem = await _context.WishlistItems
                .FirstOrDefaultAsync(w => w.UserId == userId && w.ProductId == productId);

            if (wishlistItem == null)
            {
                return NotFound();
            }

            _context.WishlistItems.Remove(wishlistItem);
            await _context.SaveChangesAsync();

            return Ok(new { message = "Removed from wishlist" });
        }
    }
    public class UpdateProfileRequest
    {
        public string FirstName { get; set; }
        public string LastName { get; set; }
        public string Email { get; set; }
        public string? PhoneNumber { get; set; }
        public DateTime DateOfBirth { get; set; }
        public string? Gender { get; set; }
    }
    public class AddAddressRequest
    {
        public string AddressLine1 { get; set; }
        public string? AddressLine2 { get; set; }
        public string City { get; set; }
        public string? State { get; set; }
        public string PostalCode { get; set; }
        public string Country { get; set; }
        public string? AddressType { get; set; }
        public bool IsDefault { get; set; } = false;
        public bool IsBillingAddress { get; set; } = false;
        public bool IsShippingAddress { get; set; } = true;
    }

    public class OrderDto
    {
        public int Id { get; set; }
        public string OrderNumber { get; set; }
        public DateTime OrderDate { get; set; }
        public string Status { get; set; }
        public decimal TotalAmount { get; set; }
        public int ItemCount { get; set; }
        public string ShippingAddress { get; set; }
    }

    public class WishlistDto
    {
        public int Id { get; set; }
        public ProductDto Product { get; set; }
        public DateTime AddedAt { get; set; }
    }
}