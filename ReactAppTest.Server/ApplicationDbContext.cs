using Microsoft.EntityFrameworkCore;
using ReactAppTest.Server.Models;
namespace ReactAppTest.Server
{
    public class ApplicationDbContext: DbContext
    {
        public ApplicationDbContext(DbContextOptions<ApplicationDbContext> options)
           : base(options) { }

        public DbSet<Products> Products { get; set; }
        public DbSet<Categories> Categories { get; set; }
        public DbSet<Collections> Collections { get; set; }
    }
}
