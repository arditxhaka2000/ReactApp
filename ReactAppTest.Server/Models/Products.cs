using Microsoft.EntityFrameworkCore;
using System.Collections.Generic;

namespace ReactAppTest.Server.Models
{
    public class Products
    {
        public int Id { get; set; }
        public string Name { get; set; }
        public decimal Price { get; set; }
        public string Brand { get; set; }
        public bool InStock { get; set; }
        public string? Description { get; set; }
        public string? ImageUrl { get; set; }
        public int CategoryId { get; set; }      
        public Categories Category { get; set; }
    }

}
