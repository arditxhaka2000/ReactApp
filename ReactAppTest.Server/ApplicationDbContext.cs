using Microsoft.EntityFrameworkCore;
using ReactAppTest.Server.Models;

namespace ReactAppTest.Server
{
    public class ApplicationDbContext : DbContext
    {
        public ApplicationDbContext(DbContextOptions<ApplicationDbContext> options)
           : base(options) { }

        // Original DbSets
        public DbSet<Products> Products { get; set; }
        public DbSet<Categories> Categories { get; set; }
        public DbSet<Collections> Collections { get; set; }

        // New DbSets for enhanced functionality
        public DbSet<ProductImages> ProductImages { get; set; }
        public DbSet<Sizes> Sizes { get; set; }
        public DbSet<ProductSizes> ProductSizes { get; set; }
        public DbSet<Users> Users { get; set; }
        public DbSet<UserAddresses> UserAddresses { get; set; }
        public DbSet<CartItems> CartItems { get; set; }
        public DbSet<WishlistItems> WishlistItems { get; set; }
        public DbSet<Orders> Orders { get; set; }
        public DbSet<OrderItems> OrderItems { get; set; }
        public DbSet<ProductReviews> ProductReviews { get; set; }
        public DbSet<Tags> Tags { get; set; }
        public DbSet<ProductTags> ProductTags { get; set; }
        public DbSet<DiscountCodes> DiscountCodes { get; set; }
        public DbSet<NewsletterSubscriptions> NewsletterSubscriptions { get; set; }
        public DbSet<SiteSettings> SiteSettings { get; set; }

        protected override void OnModelCreating(ModelBuilder modelBuilder)
        {
            base.OnModelCreating(modelBuilder);

            // Configure Product relationships
            modelBuilder.Entity<Products>()
                .HasOne(p => p.Category)
                .WithMany(c => c.Products)
                .HasForeignKey(p => p.CategoryId)
                .OnDelete(DeleteBehavior.Restrict);

            modelBuilder.Entity<Products>()
                .HasOne(p => p.Collection)
                .WithMany(c => c.Products)
                .HasForeignKey(p => p.CollectionId)
                .OnDelete(DeleteBehavior.SetNull);

            // Configure ProductImages
            modelBuilder.Entity<ProductImages>()
                .HasOne(pi => pi.Product)
                .WithMany(p => p.ProductImages)
                .HasForeignKey(pi => pi.ProductId)
                .OnDelete(DeleteBehavior.Cascade);

            // Configure ProductSizes (Many-to-Many with additional properties)
            modelBuilder.Entity<ProductSizes>()
                .HasOne(ps => ps.Product)
                .WithMany(p => p.ProductSizes)
                .HasForeignKey(ps => ps.ProductId)
                .OnDelete(DeleteBehavior.Cascade);

            modelBuilder.Entity<ProductSizes>()
                .HasOne(ps => ps.Size)
                .WithMany(s => s.ProductSizes)
                .HasForeignKey(ps => ps.SizeId)
                .OnDelete(DeleteBehavior.Restrict);

            // Configure User relationships
            modelBuilder.Entity<UserAddresses>()
                .HasOne(ua => ua.User)
                .WithMany(u => u.UserAddresses)
                .HasForeignKey(ua => ua.UserId)
                .OnDelete(DeleteBehavior.Cascade);

            // Configure Cart relationships
            modelBuilder.Entity<CartItems>()
                .HasOne(ci => ci.User)
                .WithMany(u => u.CartItems)
                .HasForeignKey(ci => ci.UserId)
                .OnDelete(DeleteBehavior.Cascade);

            modelBuilder.Entity<CartItems>()
                .HasOne(ci => ci.Product)
                .WithMany(p => p.CartItems)
                .HasForeignKey(ci => ci.ProductId)
                .OnDelete(DeleteBehavior.Cascade);

            modelBuilder.Entity<CartItems>()
                .HasOne(ci => ci.Size)
                .WithMany()
                .HasForeignKey(ci => ci.SizeId)
                .OnDelete(DeleteBehavior.Restrict);

            // Configure Wishlist relationships
            modelBuilder.Entity<WishlistItems>()
                .HasOne(wi => wi.User)
                .WithMany(u => u.WishlistItems)
                .HasForeignKey(wi => wi.UserId)
                .OnDelete(DeleteBehavior.Cascade);

            modelBuilder.Entity<WishlistItems>()
                .HasOne(wi => wi.Product)
                .WithMany(p => p.WishlistItems)
                .HasForeignKey(wi => wi.ProductId)
                .OnDelete(DeleteBehavior.Cascade);

            // Configure Order relationships
            modelBuilder.Entity<Orders>()
                .HasOne(o => o.User)
                .WithMany(u => u.Orders)
                .HasForeignKey(o => o.UserId)
                .OnDelete(DeleteBehavior.Restrict);

            modelBuilder.Entity<OrderItems>()
                .HasOne(oi => oi.Order)
                .WithMany(o => o.OrderItems)
                .HasForeignKey(oi => oi.OrderId)
                .OnDelete(DeleteBehavior.Cascade);

            modelBuilder.Entity<OrderItems>()
                .HasOne(oi => oi.Product)
                .WithMany(p => p.OrderItems)
                .HasForeignKey(oi => oi.ProductId)
                .OnDelete(DeleteBehavior.Restrict);

            modelBuilder.Entity<OrderItems>()
                .HasOne(oi => oi.Size)
                .WithMany()
                .HasForeignKey(oi => oi.SizeId)
                .OnDelete(DeleteBehavior.Restrict);

            // Configure ProductReviews relationships
            modelBuilder.Entity<ProductReviews>()
                .HasOne(pr => pr.Product)
                .WithMany(p => p.ProductReviews)
                .HasForeignKey(pr => pr.ProductId)
                .OnDelete(DeleteBehavior.Cascade);

            modelBuilder.Entity<ProductReviews>()
                .HasOne(pr => pr.User)
                .WithMany(u => u.ProductReviews)
                .HasForeignKey(pr => pr.UserId)
                .OnDelete(DeleteBehavior.Cascade);

            // Configure ProductTags (Many-to-Many)
            modelBuilder.Entity<ProductTags>()
                .HasKey(pt => new { pt.ProductId, pt.TagId });

            modelBuilder.Entity<ProductTags>()
                .HasOne(pt => pt.Product)
                .WithMany(p => p.ProductTags)
                .HasForeignKey(pt => pt.ProductId)
                .OnDelete(DeleteBehavior.Cascade);

            modelBuilder.Entity<ProductTags>()
                .HasOne(pt => pt.Tag)
                .WithMany(t => t.ProductTags)
                .HasForeignKey(pt => pt.TagId)
                .OnDelete(DeleteBehavior.Cascade);

            // Configure unique constraints
            modelBuilder.Entity<Users>()
                .HasIndex(u => u.Email)
                .IsUnique();

            modelBuilder.Entity<Orders>()
                .HasIndex(o => o.OrderNumber)
                .IsUnique();

            modelBuilder.Entity<DiscountCodes>()
                .HasIndex(dc => dc.Code)
                .IsUnique();

            modelBuilder.Entity<NewsletterSubscriptions>()
                .HasIndex(ns => ns.Email)
                .IsUnique();

            modelBuilder.Entity<SiteSettings>()
                .HasIndex(ss => ss.Key)
                .IsUnique();

            modelBuilder.Entity<Tags>()
                .HasIndex(t => t.Name)
                .IsUnique();

            // Configure composite unique constraints
            modelBuilder.Entity<WishlistItems>()
                .HasIndex(wi => new { wi.UserId, wi.ProductId })
                .IsUnique();

            modelBuilder.Entity<CartItems>()
                .HasIndex(ci => new { ci.UserId, ci.ProductId, ci.SizeId })
                .IsUnique();

            modelBuilder.Entity<ProductReviews>()
                .HasIndex(pr => new { pr.UserId, pr.ProductId })
                .IsUnique(); // One review per user per product

            // Configure decimal precision for all decimal properties
            foreach (var entityType in modelBuilder.Model.GetEntityTypes())
            {
                foreach (var property in entityType.GetProperties())
                {
                    if (property.ClrType == typeof(decimal) || property.ClrType == typeof(decimal?))
                    {
                        property.SetColumnType("decimal(18,2)");
                    }
                }
            }

           
        }
    }
}