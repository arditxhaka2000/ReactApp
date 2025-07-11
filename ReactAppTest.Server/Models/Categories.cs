﻿namespace ReactAppTest.Server.Models
{
    public class Categories
    {
        public int Id { get; set; }
        public string Name { get; set; }
        public string Description { get; set; }
        public string ImageUrl { get; set; }
        public int IsActive { get; set; } = 1;
        public DateTime CreatedAt { get; set; }

        public ICollection<Products> Products { get; set; } = new List<Products>();
    }
}
