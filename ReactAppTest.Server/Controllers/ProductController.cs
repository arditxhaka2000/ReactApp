using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;
using ReactAppTest.Server.Attributes;
using ReactAppTest.Server.Models;
using System.ComponentModel.DataAnnotations;

namespace ReactAppTest.Server.Controllers
{
    [ApiController]
    [Route("api/[controller]")]
    public class ProductsController : ControllerBase
    {
        private readonly ApplicationDbContext _context;
        private readonly ILogger<ProductsController> _logger;
        public ProductsController(ApplicationDbContext context, ILogger<ProductsController> logger)
        {
            _context = context;
            _logger = logger;
        }

        // GET: api/Products
        [HttpGet]
        public async Task<ActionResult<IEnumerable<ProductDto>>> GetProducts()
        {
            var products = await _context.Products
                .Include(p => p.Category)
                .Include(p => p.Collection)
                .Include(p => p.ProductImages)
                .Include(p => p.ProductSizes)
                    .ThenInclude(ps => ps.Size)
                .Include(p => p.ProductReviews.Where(pr => pr.IsApproved))
                .Include(p => p.ProductTags)
                    .ThenInclude(pt => pt.Tag)
                .Select(p => new ProductDto
                {
                    Id = p.Id,
                    Name = p.Name,
                    Price = p.Price,
                    OriginalPrice = p.OriginalPrice,
                    Brand = p.Brand,
                    InStock = p.InStock,
                    Description = p.Description,
                    Color = p.Color,
                    Material = p.Material,
                    CareInstructions = p.CareInstructions,
                    Fit = p.Fit,
                    IsFeatured = p.IsFeatured,
                    IsNewArrival = p.IsNewArrival,
                    IsOnSale = p.IsOnSale,
                    Category = new CategoryDto
                    {
                        Id = p.Category.Id,
                        Name = p.Category.Name,
                        Description = p.Category.Description
                    },
                    Collection = p.Collection != null ? new CollectionDto
                    {
                        Id = p.Collection.Id,
                        Name = p.Collection.Name,
                        Description = p.Collection.Description
                    } : null,
                    Images = p.ProductImages.OrderBy(pi => pi.SortOrder).Select(pi => new ProductImageDto
                    {
                        Id = pi.Id,
                        ImageUrl = pi.ImageUrl,
                        AltText = pi.AltText,
                        IsPrimary = pi.IsPrimary
                    }).ToList(),
                    Sizes = p.ProductSizes.Where(ps => ps.IsInStock).OrderBy(ps => ps.Size.SortOrder).Select(ps => new ProductSizeDto
                    {
                        SizeId = ps.SizeId,
                        SizeName = ps.Size.Name,
                        USSize = ps.Size.USSize,
                        EUSize = ps.Size.EUSize,
                        Bust = ps.Size.Bust,
                        Waist = ps.Size.Waist,
                        Hips = ps.Size.Hips,
                        StockQuantity = ps.StockQuantity,
                        IsInStock = ps.IsInStock
                    }).ToList(),
                    Tags = p.ProductTags.Where(pt => pt.Tag.IsActive).Select(pt => new TagDto
                    {
                        Id = pt.Tag.Id,
                        Name = pt.Tag.Name,
                        Color = pt.Tag.Color
                    }).ToList(),
                    AverageRating = p.ProductReviews.Any() ? Math.Round(p.ProductReviews.Average(pr => pr.Rating), 1) : 0,
                    ReviewCount = p.ProductReviews.Count()
                })
                .ToListAsync();
            return Ok(products);
        }

        // GET: api/Products/5
        [HttpGet("{id}")]
        public async Task<ActionResult<ProductDto>> GetProduct(int id)
        {
            var product = await _context.Products
                .Include(p => p.Category)
                .Include(p => p.Collection)
                .Include(p => p.ProductImages)
                .Include(p => p.ProductSizes)
                    .ThenInclude(ps => ps.Size)
                .Include(p => p.ProductReviews.Where(pr => pr.IsApproved))
                    .ThenInclude(pr => pr.User)
                .Include(p => p.ProductTags)
                    .ThenInclude(pt => pt.Tag)
                .Where(p => p.Id == id)
                .Select(p => new ProductDto
                {
                    Id = p.Id,
                    Name = p.Name,
                    Price = p.Price,
                    OriginalPrice = p.OriginalPrice,
                    Brand = p.Brand,
                    InStock = p.InStock,
                    Description = p.Description,
                    Color = p.Color,
                    Material = p.Material,
                    CareInstructions = p.CareInstructions,
                    Fit = p.Fit,
                    IsFeatured = p.IsFeatured,
                    IsNewArrival = p.IsNewArrival,
                    IsOnSale = p.IsOnSale,
                    Category = new CategoryDto
                    {
                        Id = p.Category.Id,
                        Name = p.Category.Name,
                        Description = p.Category.Description
                    },
                    Collection = p.Collection != null ? new CollectionDto
                    {
                        Id = p.Collection.Id,
                        Name = p.Collection.Name,
                        Description = p.Collection.Description
                    } : null,
                    Images = p.ProductImages.OrderBy(pi => pi.SortOrder).Select(pi => new ProductImageDto
                    {
                        Id = pi.Id,
                        ImageUrl = pi.ImageUrl,
                        AltText = pi.AltText,
                        IsPrimary = pi.IsPrimary
                    }).ToList(),
                    Sizes = p.ProductSizes.OrderBy(ps => ps.Size.SortOrder).Select(ps => new ProductSizeDto
                    {
                        SizeId = ps.SizeId,
                        SizeName = ps.Size.Name,
                        USSize = ps.Size.USSize,
                        EUSize = ps.Size.EUSize,
                        Bust = ps.Size.Bust,
                        Waist = ps.Size.Waist,
                        Hips = ps.Size.Hips,
                        StockQuantity = ps.StockQuantity,
                        IsInStock = ps.IsInStock
                    }).ToList(),
                    Tags = p.ProductTags.Where(pt => pt.Tag.IsActive).Select(pt => new TagDto
                    {
                        Id = pt.Tag.Id,
                        Name = pt.Tag.Name,
                        Color = pt.Tag.Color
                    }).ToList(),
                    Reviews = p.ProductReviews.OrderByDescending(pr => pr.CreatedAt).Select(pr => new ProductReviewDto
                    {
                        Id = pr.Id,
                        Rating = pr.Rating,
                        Title = pr.Title,
                        Comment = pr.Comment,
                        IsVerifiedPurchase = pr.IsVerifiedPurchase,
                        CreatedAt = pr.CreatedAt,
                        HelpfulVotes = pr.HelpfulVotes,
                        UserName = pr.User.FirstName
                    }).ToList(),
                    AverageRating = p.ProductReviews.Any() ? Math.Round(p.ProductReviews.Average(pr => pr.Rating), 1) : 0,
                    ReviewCount = p.ProductReviews.Count()
                })
                .FirstOrDefaultAsync();

            if (product == null)
            {
                return NotFound();
            }
            return Ok(product);
        }
        [HttpGet("admin")]
        [AdminAuthorize] // Require authentication for admin endpoints
        public async Task<ActionResult<IEnumerable<AdminProductDto>>> GetAdminProducts()
        {
            try
            {
                var products = await _context.Products
                    .Include(p => p.Category)
                    .Include(p => p.Collection)
                    .Include(p => p.ProductImages.Where(pi => pi.IsPrimary))
                    .OrderByDescending(p => p.CreatedAt)
                    .Select(p => new AdminProductDto
                    {
                        Id = p.Id,
                        Name = p.Name,
                        Price = p.Price,
                        OriginalPrice = p.OriginalPrice,
                        Brand = p.Brand,
                        InStock = p.InStock,
                        Description = p.Description,
                        Color = p.Color,
                        Material = p.Material,
                        CareInstructions = p.CareInstructions,
                        Fit = p.Fit,
                        IsFeatured = p.IsFeatured,
                        IsNewArrival = p.IsNewArrival,
                        IsOnSale = p.IsOnSale,
                        CreatedAt = p.CreatedAt,
                        UpdatedAt = p.UpdatedAt,
                        Category = p.Category != null ? new CategoryDto
                        {
                            Id = p.Category.Id,
                            Name = p.Category.Name,
                            Description = p.Category.Description
                        } : null,
                        Collection = p.Collection != null ? new CollectionDto
                        {
                            Id = p.Collection.Id,
                            Name = p.Collection.Name,
                            Description = p.Collection.Description
                        } : null,
                        Images = p.ProductImages.Select(pi => new ProductImageDto
                        {
                            Id = pi.Id,
                            ImageUrl = pi.ImageUrl,
                            AltText = pi.AltText,
                            IsPrimary = pi.IsPrimary
                        }).ToList()
                    })
                    .ToListAsync();

                return Ok(products);
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "Error fetching admin products");
                return StatusCode(500, new { message = "Failed to fetch products" });
            }
        }
        [HttpPost]
        [AdminAuthorize]
        public async Task<ActionResult<Products>> CreateProduct([FromBody] CreateProductRequest request)
        {
            try
            {
                if (!ModelState.IsValid)
                    return BadRequest(ModelState);

                var product = new Products
                {
                    Name = request.Name,
                    Price = request.Price,
                    OriginalPrice = request.OriginalPrice,
                    Brand = request.Brand,
                    Description = request.Description,
                    CategoryId = request.CategoryId,
                    CollectionId = request.CollectionId,
                    Color = request.Color,
                    Material = request.Material,
                    CareInstructions = request.CareInstructions,
                    Fit = request.Fit,
                    InStock = request.InStock,
                    IsFeatured = request.IsFeatured,
                    IsNewArrival = request.IsNewArrival,
                    IsOnSale = request.IsOnSale,
                    CreatedAt = DateTime.UtcNow,
                    UpdatedAt = DateTime.UtcNow
                };

                _context.Products.Add(product);
                await _context.SaveChangesAsync();

                _logger.LogInformation($"Product created: {product.Name} (ID: {product.Id})");

                return CreatedAtAction(nameof(GetProduct), new { id = product.Id }, product);
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "Error creating product");
                return StatusCode(500, new { message = "Failed to create product" });
            }
        }
        [HttpDelete("{id}")]
        [AdminAuthorize]
        public async Task<IActionResult> DeleteProduct(int id)
        {
            try
            {
                var product = await _context.Products.FindAsync(id);
                if (product == null)
                    return NotFound();

                // Check if product has related data (orders, cart items, etc.)
                var hasOrders = await _context.OrderItems.AnyAsync(oi => oi.ProductId == id);
                if (hasOrders)
                {
                    return BadRequest(new { message = "Cannot delete product with existing orders. Consider marking it as inactive instead." });
                }

                // Remove related data first
                var cartItems = await _context.CartItems.Where(ci => ci.ProductId == id).ToListAsync();
                _context.CartItems.RemoveRange(cartItems);

                var wishlistItems = await _context.WishlistItems.Where(wi => wi.ProductId == id).ToListAsync();
                _context.WishlistItems.RemoveRange(wishlistItems);

                var productImages = await _context.ProductImages.Where(pi => pi.ProductId == id).ToListAsync();
                _context.ProductImages.RemoveRange(productImages);

                var productSizes = await _context.ProductSizes.Where(ps => ps.ProductId == id).ToListAsync();
                _context.ProductSizes.RemoveRange(productSizes);

                var productTags = await _context.ProductTags.Where(pt => pt.ProductId == id).ToListAsync();
                _context.ProductTags.RemoveRange(productTags);

                var productReviews = await _context.ProductReviews.Where(pr => pr.ProductId == id).ToListAsync();
                _context.ProductReviews.RemoveRange(productReviews);

                // Finally remove the product
                _context.Products.Remove(product);
                await _context.SaveChangesAsync();

                _logger.LogInformation($"Product deleted: {product.Name} (ID: {product.Id})");

                return NoContent();
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, $"Error deleting product {id}");
                return StatusCode(500, new { message = "Failed to delete product" });
            }
        }
    }
    public class AdminProductDto : ProductDto
    {
        public DateTime CreatedAt { get; set; }
        public DateTime UpdatedAt { get; set; }
    }
    // DTOs for API responses
    public class ProductDto
    {
        public int Id { get; set; }
        public string Name { get; set; }
        public decimal Price { get; set; }
        public decimal? OriginalPrice { get; set; }
        public string Brand { get; set; }
        public bool InStock { get; set; }
        public string? Description { get; set; }
        public string? Color { get; set; }
        public string? Material { get; set; }
        public string? CareInstructions { get; set; }
        public string? Fit { get; set; }
        public bool IsFeatured { get; set; }
        public bool IsNewArrival { get; set; }
        public bool IsOnSale { get; set; }
        public CategoryDto Category { get; set; }
        public CollectionDto? Collection { get; set; }
        public List<ProductImageDto> Images { get; set; } = new();
        public List<ProductSizeDto> Sizes { get; set; } = new();
        public List<TagDto> Tags { get; set; } = new();
        public List<ProductReviewDto> Reviews { get; set; } = new();
        public double AverageRating { get; set; }
        public int ReviewCount { get; set; }
    }

    public class CategoryDto
    {
        public int Id { get; set; }
        public string Name { get; set; }
        public string Description { get; set; }
    }

    public class CollectionDto
    {
        public int Id { get; set; }
        public string Name { get; set; }
        public string Description { get; set; }
    }

    public class ProductImageDto
    {
        public int Id { get; set; }
        public string ImageUrl { get; set; }
        public string? AltText { get; set; }
        public bool IsPrimary { get; set; }
    }

    public class ProductSizeDto
    {
        public int SizeId { get; set; }
        public string SizeName { get; set; }
        public string? USSize { get; set; }
        public string? EUSize { get; set; }
        public string? Bust { get; set; }
        public string? Waist { get; set; }
        public string? Hips { get; set; }
        public int StockQuantity { get; set; }
        public bool IsInStock { get; set; }
    }

    public class TagDto
    {
        public int Id { get; set; }
        public string Name { get; set; }
        public string? Color { get; set; }
    }

    public class ProductReviewDto
    {
        public int Id { get; set; }
        public int Rating { get; set; }
        public string? Title { get; set; }
        public string? Comment { get; set; }
        public bool IsVerifiedPurchase { get; set; }
        public DateTime CreatedAt { get; set; }
        public int HelpfulVotes { get; set; }
        public string UserName { get; set; }
    }
    public class CreateProductRequest
    {
        [Required]
        [StringLength(200)]
        public string Name { get; set; }

        [Required]
        [Range(0.01, double.MaxValue)]
        public decimal Price { get; set; }

        [Range(0.01, double.MaxValue)]
        public decimal? OriginalPrice { get; set; }

        [StringLength(100)]
        public string Brand { get; set; }

        [StringLength(2000)]
        public string? Description { get; set; }

        [Required]
        public int CategoryId { get; set; }

        public int? CollectionId { get; set; }

        [StringLength(50)]
        public string? Color { get; set; }

        [StringLength(100)]
        public string? Material { get; set; }

        [StringLength(100)]
        public string? CareInstructions { get; set; }

        [StringLength(50)]
        public string? Fit { get; set; }

        public bool InStock { get; set; } = true;
        public bool IsFeatured { get; set; } = false;
        public bool IsNewArrival { get; set; } = false;
        public bool IsOnSale { get; set; } = false;
    }
}