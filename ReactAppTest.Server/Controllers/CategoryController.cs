using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;
using ReactAppTest.Server.Models;
using System.ComponentModel.DataAnnotations;

namespace ReactAppTest.Server.Controllers
{
    [ApiController]
    [Route("api/[controller]")]
    public class CategoryController : ControllerBase
    {
        private readonly ApplicationDbContext _context;

        public CategoryController(ApplicationDbContext context)
        {
            _context = context;
        }
        [HttpGet]
        public async Task<IActionResult> GetCategories()
        {
            var categories = await _context.Categories
                               .Select(c => new { c.Id, c.Name })
                               .ToListAsync();
            return Ok(categories);
        }
        [HttpGet("{id}")]
        public async Task<ActionResult<CategoryDto>> GetCategory(int id)
        {
            var category = await _context.Categories
                .Where(c => c.Id == id && c.IsActive == 1)
                .Select(c => new CategoryDto
                {
                    Id = c.Id,
                    Name = c.Name,
                    Description = c.Description,

                })
                .FirstOrDefaultAsync();

            if (category == null)
            {
                return NotFound();
            }

            return Ok(category);
        }
        [HttpPost]
        [Authorize]
        public async Task<ActionResult<Categories>> CreateCategory([FromBody] CreateCategoryRequest request)
        {
            var category = new Categories
            {
                Name = request.Name,
                Description = request.Description,
                IsActive = 1,
                CreatedAt = DateTime.UtcNow
            };

            _context.Categories.Add(category);
            await _context.SaveChangesAsync();

            return CreatedAtAction(nameof(GetCategory), new { id = category.Id }, category);
        }

        // PUT: api/categories/5 (Admin only)
        [HttpPut("{id}")]
        [Authorize]
        public async Task<ActionResult<Categories>> UpdateCategory(int id, [FromBody] UpdateCategoryRequest request)
        {
            var category = await _context.Categories.FindAsync(id);
            if (category == null)
                return NotFound();

            category.Name = request.Name;
            category.Description = request.Description;
            category.IsActive = request.IsActive;

            await _context.SaveChangesAsync();
            return Ok(category);
        }

        // DELETE: api/categories/5 (Admin only)
        [HttpDelete("{id}")]
        [Authorize]
        public async Task<IActionResult> DeleteCategory(int id)
        {
            var category = await _context.Categories.FindAsync(id);
            if (category == null)
                return NotFound();

            // Check if category has products
            var hasProducts = await _context.Products.AnyAsync(p => p.CategoryId == id);
            if (hasProducts)
            {
                return BadRequest(new { message = "Cannot delete category with existing products" });
            }

            _context.Categories.Remove(category);
            await _context.SaveChangesAsync();

            return NoContent();
        }
    }
    public class CreateCategoryRequest
    {
        [Required]
        [StringLength(100)]
        public string Name { get; set; }

        [StringLength(500)]
        public string? Description { get; set; }
    }
    public class UpdateCategoryRequest : CreateCategoryRequest
    {
        public int IsActive { get; set; } = 1;
    }
}
