using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;

namespace ReactAppTest.Server.Controllers
{
    [ApiController]
    [Route("api/[controller]")]
    public class CollectionsController : ControllerBase
    {
        private readonly ApplicationDbContext _context;

        public CollectionsController(ApplicationDbContext context)
        {
            _context = context;
        }

        [HttpGet]
        public async Task<IActionResult> GetCollections()
        {
            var collections = await _context.Collections.ToListAsync();
            return Ok(collections);
        }
    }
}
