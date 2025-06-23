using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;
using ReactAppTest.Server.Models;

namespace ReactAppTest.Server.Controllers
{
    [ApiController]
    [Route("api/[controller]")]
    public class ProductsController : ControllerBase
    {
        private readonly ApplicationDbContext _context;

        public ProductsController(ApplicationDbContext context)
        {
            _context = context;
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
}