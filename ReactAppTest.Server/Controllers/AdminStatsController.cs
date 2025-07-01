using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;
using ReactAppTest.Server.Models;

namespace ReactAppTest.Server.Controllers
{
    [ApiController]
    [Route("api/[controller]")]
    [Authorize] // Require authentication
    public class AdminStatsController : ControllerBase
    {
        private readonly ApplicationDbContext _context;
        private readonly ILogger<AdminStatsController> _logger;

        public AdminStatsController(ApplicationDbContext context, ILogger<AdminStatsController> logger)
        {
            _context = context;
            _logger = logger;
        }

        [HttpGet("dashboard")]
        public async Task<IActionResult> GetDashboardStats()
        {
            try
            {
                // Check if user is admin
                var currentUserId = GetCurrentUserId();
                if (currentUserId == null)
                    return Unauthorized();

                var currentUser = await _context.Users.FindAsync(currentUserId);
                if (currentUser == null || (!currentUser.IsAdmin && currentUser.Role != "Admin" && currentUser.Role != "SuperAdmin"))
                    return Forbid("Admin access required");

                // Get total products
                var totalProducts = await _context.Products.CountAsync();

                // Get total active products
                var activeProducts = await _context.Products.CountAsync(p => p.InStock);

                // Get total users
                var totalUsers = await _context.Users.CountAsync();

                // Get total customers (non-admin users)
                var totalCustomers = await _context.Users.CountAsync(u => !u.IsAdmin && u.Role == "Customer");

                // Get total orders
                var totalOrders = await _context.Orders.CountAsync();

                // Get completed orders
                var completedOrders = await _context.Orders.CountAsync(o => o.Status == "Completed" || o.Status == "Delivered");

                // Get pending orders
                var pendingOrders = await _context.Orders.CountAsync(o => o.Status == "Pending" || o.Status == "Processing");

                // Calculate total revenue (from completed orders)
                var totalRevenue = await _context.Orders
                    .Where(o => o.Status == "Completed" || o.Status == "Delivered")
                    .SumAsync(o => o.TotalAmount);

                // Get this month's revenue
                var currentMonth = DateTime.UtcNow.Month;
                var currentYear = DateTime.UtcNow.Year;
                var monthlyRevenue = await _context.Orders
                    .Where(o => (o.Status == "Completed" || o.Status == "Delivered") &&
                               o.OrderDate.Month == currentMonth &&
                               o.OrderDate.Year == currentYear)
                    .SumAsync(o => o.TotalAmount);

                // Get recent orders (last 30 days)
                var thirtyDaysAgo = DateTime.UtcNow.AddDays(-30);
                var recentOrdersCount = await _context.Orders
                    .CountAsync(o => o.OrderDate >= thirtyDaysAgo);

                // Get low stock products (less than 10 in stock)
                var lowStockProducts = await _context.Products
                    .Where(p => p.StockQuantity <= 10 && p.InStock)
                    .CountAsync();

                // Get top selling products (last 30 days)
                var topProducts = await _context.OrderItems
                    .Include(oi => oi.Product)
                    .Where(oi => oi.Order.OrderDate >= thirtyDaysAgo)
                    .GroupBy(oi => new { oi.ProductId, oi.Product.Name })
                    .Select(g => new TopProductDto
                    {
                        ProductId = g.Key.ProductId,
                        ProductName = g.Key.Name,
                        TotalSold = g.Sum(oi => oi.Quantity),
                        Revenue = g.Sum(oi => oi.Quantity * oi.UnitPrice)
                    })
                    .OrderByDescending(tp => tp.TotalSold)
                    .Take(5)
                    .ToListAsync();

                // Get recent orders for display
                var recentOrders = await _context.Orders
                    .Include(o => o.User)
                    .OrderByDescending(o => o.OrderDate)
                    .Take(10)
                    .Select(o => new RecentOrderDto
                    {
                        Id = o.Id,
                        OrderNumber = o.OrderNumber,
                        CustomerName = $"{o.User.FirstName} {o.User.LastName}",
                        TotalAmount = o.TotalAmount,
                        Status = o.Status,
                        OrderDate = o.OrderDate
                    })
                    .ToListAsync();

                // Get sales chart data (last 7 days)
                var salesChartData = new List<DailySalesDto>();
                for (int i = 6; i >= 0; i--)
                {
                    var date = DateTime.UtcNow.Date.AddDays(-i);
                    var nextDate = date.AddDays(1);

                    var dailySales = await _context.Orders
                        .Where(o => o.OrderDate >= date && o.OrderDate < nextDate &&
                                   (o.Status == "Completed" || o.Status == "Delivered"))
                        .SumAsync(o => o.TotalAmount);

                    var dailyOrderCount = await _context.Orders
                        .CountAsync(o => o.OrderDate >= date && o.OrderDate < nextDate);

                    salesChartData.Add(new DailySalesDto
                    {
                        Date = date.ToString("MMM dd"),
                        Sales = dailySales,
                        Orders = dailyOrderCount
                    });
                }

                var dashboardStats = new DashboardStatsDto
                {
                    TotalProducts = totalProducts,
                    ActiveProducts = activeProducts,
                    TotalUsers = totalUsers,
                    TotalCustomers = totalCustomers,
                    TotalOrders = totalOrders,
                    CompletedOrders = completedOrders,
                    PendingOrders = pendingOrders,
                    TotalRevenue = totalRevenue,
                    MonthlyRevenue = monthlyRevenue,
                    RecentOrdersCount = recentOrdersCount,
                    LowStockProducts = lowStockProducts,
                    TopProducts = topProducts,
                    RecentOrders = recentOrders,
                    SalesChartData = salesChartData
                };

                return Ok(dashboardStats);
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "Error getting dashboard stats");
                return StatusCode(500, new { message = "Failed to get dashboard statistics" });
            }
        }

        [HttpGet("users")]
        public async Task<IActionResult> GetUsersStats()
        {
            try
            {
                // Check if user is admin
                var currentUserId = GetCurrentUserId();
                if (currentUserId == null)
                    return Unauthorized();

                var currentUser = await _context.Users.FindAsync(currentUserId);
                if (currentUser == null || (!currentUser.IsAdmin && currentUser.Role != "Admin" && currentUser.Role != "SuperAdmin"))
                    return Forbid("Admin access required");

                var users = await _context.Users
                    .Select(u => new UserStatsDto
                    {
                        Id = u.Id,
                        FirstName = u.FirstName,
                        LastName = u.LastName,
                        Email = u.Email,
                        Role = u.Role,
                        IsAdmin = u.IsAdmin,
                        IsActive = u.IsActive,
                        CreatedAt = u.CreatedAt,
                        LastLoginAt = u.LastLoginAt,
                        OrderCount = u.Orders.Count(),
                        TotalSpent = u.Orders.Where(o => o.Status == "Completed" || o.Status == "Delivered").Sum(o => o.TotalAmount)
                    })
                    .OrderByDescending(u => u.CreatedAt)
                    .ToListAsync();

                return Ok(users);
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "Error getting users stats");
                return StatusCode(500, new { message = "Failed to get users statistics" });
            }
        }

        [HttpGet("orders")]
        public async Task<IActionResult> GetOrdersStats()
        {
            try
            {
                // Check if user is admin
                var currentUserId = GetCurrentUserId();
                if (currentUserId == null)
                    return Unauthorized();

                var currentUser = await _context.Users.FindAsync(currentUserId);
                if (currentUser == null || (!currentUser.IsAdmin && currentUser.Role != "Admin" && currentUser.Role != "SuperAdmin"))
                    return Forbid("Admin access required");

                var orders = await _context.Orders
                    .Include(o => o.User)
                    .Include(o => o.OrderItems)
                    .ThenInclude(oi => oi.Product)
                    .Select(o => new OrderStatsDto
                    {
                        Id = o.Id,
                        OrderNumber = o.OrderNumber,
                        CustomerName = $"{o.User.FirstName} {o.User.LastName}",
                        CustomerEmail = o.User.Email,
                        TotalAmount = o.TotalAmount,
                        Status = o.Status,
                        OrderDate = o.OrderDate,
                        ShippingAddress = o.ShippingAddressLine1 + o.ShippingAddressLine2+ o.ShippingCity + o.ShippingCountry,
                        ItemCount = o.OrderItems.Count(),
                        Items = o.OrderItems.Select(oi => new OrderItemDto
                        {
                            ProductName = oi.Product.Name,
                            Quantity = oi.Quantity,
                            UnitPrice = oi.UnitPrice,
                            TotalPrice = oi.Quantity * oi.UnitPrice
                        }).ToList()
                    })
                    .OrderByDescending(o => o.OrderDate)
                    .ToListAsync();

                return Ok(orders);
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "Error getting orders stats");
                return StatusCode(500, new { message = "Failed to get orders statistics" });
            }
        }

        [HttpPut("orders/{orderId}/status")]
        public async Task<IActionResult> UpdateOrderStatus(int orderId, [FromBody] UpdateOrderStatusRequest request)
        {
            try
            {
                // Check if user is admin
                var currentUserId = GetCurrentUserId();
                if (currentUserId == null)
                    return Unauthorized();

                var currentUser = await _context.Users.FindAsync(currentUserId);
                if (currentUser == null || (!currentUser.IsAdmin && currentUser.Role != "Admin" && currentUser.Role != "SuperAdmin"))
                    return Forbid("Admin access required");

                var order = await _context.Orders.FindAsync(orderId);
                if (order == null)
                    return NotFound("Order not found");

                order.Status = request.Status;
                await _context.SaveChangesAsync();

                _logger.LogInformation($"Order {order.OrderNumber} status updated to {request.Status} by admin {currentUser.Email}");

                return Ok(new { message = "Order status updated successfully" });
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "Error updating order status");
                return StatusCode(500, new { message = "Failed to update order status" });
            }
        }

        private int? GetCurrentUserId()
        {
            var userIdClaim = User.FindFirst("userId")?.Value;
            return int.TryParse(userIdClaim, out var userId) ? userId : null;
        }
    }

    // DTOs for API responses
    public class DashboardStatsDto
    {
        public int TotalProducts { get; set; }
        public int ActiveProducts { get; set; }
        public int TotalUsers { get; set; }
        public int TotalCustomers { get; set; }
        public int TotalOrders { get; set; }
        public int CompletedOrders { get; set; }
        public int PendingOrders { get; set; }
        public decimal TotalRevenue { get; set; }
        public decimal MonthlyRevenue { get; set; }
        public int RecentOrdersCount { get; set; }
        public int LowStockProducts { get; set; }
        public List<TopProductDto> TopProducts { get; set; } = new();
        public List<RecentOrderDto> RecentOrders { get; set; } = new();
        public List<DailySalesDto> SalesChartData { get; set; } = new();
    }

    public class TopProductDto
    {
        public int ProductId { get; set; }
        public string ProductName { get; set; }
        public int TotalSold { get; set; }
        public decimal Revenue { get; set; }
    }

    public class RecentOrderDto
    {
        public int Id { get; set; }
        public string OrderNumber { get; set; }
        public string CustomerName { get; set; }
        public decimal TotalAmount { get; set; }
        public string Status { get; set; }
        public DateTime OrderDate { get; set; }
    }

    public class DailySalesDto
    {
        public string Date { get; set; }
        public decimal Sales { get; set; }
        public int Orders { get; set; }
    }

    public class UserStatsDto
    {
        public int Id { get; set; }
        public string FirstName { get; set; }
        public string LastName { get; set; }
        public string Email { get; set; }
        public string Role { get; set; }
        public bool IsAdmin { get; set; }
        public bool IsActive { get; set; }
        public DateTime CreatedAt { get; set; }
        public DateTime LastLoginAt { get; set; }
        public int OrderCount { get; set; }
        public decimal TotalSpent { get; set; }
    }

    public class OrderStatsDto
    {
        public int Id { get; set; }
        public string OrderNumber { get; set; }
        public string CustomerName { get; set; }
        public string CustomerEmail { get; set; }
        public decimal TotalAmount { get; set; }
        public string Status { get; set; }
        public DateTime OrderDate { get; set; }
        public string ShippingAddress { get; set; }
        public int ItemCount { get; set; }
        public List<OrderItemDto> Items { get; set; } = new();
    }

    public class OrderItemDto
    {
        public string ProductName { get; set; }
        public int Quantity { get; set; }
        public decimal UnitPrice { get; set; }
        public decimal TotalPrice { get; set; }
    }

    public class UpdateOrderStatusRequest
    {
        public string Status { get; set; }
    }
}