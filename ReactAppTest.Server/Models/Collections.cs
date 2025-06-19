namespace ReactAppTest.Server.Models
{
    public class Collections
    {
        public int Id { get; set; }
        public string Name { get; set; }
        public string Description { get; set; }
        public string ImageUrl { get; set; }
        public ICollection<Products> Products { get; set; } = new List<Products>();
    }
}
