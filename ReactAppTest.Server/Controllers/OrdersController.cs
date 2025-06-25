// OrderController.cs
using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;
using ReactAppTest.Server.Models;
using System.ComponentModel.DataAnnotations;

namespace ReactAppTest.Server.Controllers
{
    [ApiController]
    [Route("api/[controller]")]
    public class OrdersController : ControllerBase
    {
        private readonly ApplicationDbContext _context;
        private readonly ILogger<OrdersController> _logger;

        public OrdersController(ApplicationDbContext context, ILogger<OrdersController> logger)
        {
            _context = context;
            _logger = logger;
        }

        [HttpPost]
        public async Task<IActionResult> CreateOrder([FromBody] CreateOrderRequest request)
        {
            using var transaction = await _context.Database.BeginTransactionAsync();

            try
            {
                if (!ModelState.IsValid)
                    return BadRequest(ModelState);

                // Validate stock availability
                var stockValidation = await ValidateStockAvailability(request.Items);
                if (!stockValidation.IsValid)
                    return BadRequest(new { message = stockValidation.ErrorMessage });

                var calculatedTotals = await CalculateOrderTotals(request.Items, request.Shipping, request.PromoCode);

                if (Math.Abs(calculatedTotals.Total - request.Total) > 0.01m)
                    return BadRequest(new { message = "Order total mismatch" });

                // Find or create user
                var user = await FindOrCreateUser(request.CustomerInfo);

                var order = new Orders
                {
                    OrderNumber = GenerateOrderNumber(),
                    UserId = user.Id,
                    SubTotal = calculatedTotals.Subtotal,
                    ShippingCost = calculatedTotals.ShippingCost,
                    Tax = calculatedTotals.Tax,
                    Discount = calculatedTotals.Discount,
                    TotalAmount = calculatedTotals.Total,
                    Status = "Processing",
                    PaymentMethod = "Card",
                    PaymentStatus = "Paid", // In real implementation, process payment first
                    OrderDate = DateTime.UtcNow,

                    // Shipping address fields
                    ShippingFirstName = request.CustomerInfo.FirstName,
                    ShippingLastName = request.CustomerInfo.LastName,
                    ShippingAddressLine1 = request.ShippingAddress.Address1,
                    ShippingAddressLine2 = request.ShippingAddress.Address2,
                    ShippingCity = request.ShippingAddress.City,
                    ShippingState = request.ShippingAddress.County,
                    ShippingPostalCode = request.ShippingAddress.Postcode,
                    ShippingCountry = request.ShippingAddress.Country,
                    ShippingPhone = request.CustomerInfo.Phone,
                    Notes = request.Notes
                };

                _context.Orders.Add(order);
                await _context.SaveChangesAsync(); // Save to get OrderId

                // Create order items using your existing OrderItems model
                foreach (var item in request.Items)
                {
                    var product = await _context.Products
                        .Include(p => p.ProductSizes)
                        .ThenInclude(ps => ps.Size)
                        .FirstOrDefaultAsync(p => p.Id == item.ProductId);

                    var size = product?.ProductSizes.FirstOrDefault(ps => ps.SizeId == item.SizeId)?.Size;

                    var orderItem = new OrderItems
                    {
                        OrderId = order.Id,
                        ProductId = item.ProductId,
                        SizeId = item.SizeId,
                        Quantity = item.Quantity,
                        UnitPrice = item.Price,
                        TotalPrice = item.Price * item.Quantity,
                        ProductName = product?.Name ?? "Unknown Product",
                        ProductColor = product?.Color,
                        SizeName = size?.Name ?? "Unknown Size"
                    };

                    _context.OrderItems.Add(orderItem);
                }

                // Update stock quantities
                await UpdateStockQuantities(request.Items);

                // Apply discount code usage if used
                if (!string.IsNullOrEmpty(request.PromoCode))
                {
                    await UpdateDiscountCodeUsage(request.PromoCode);
                }

                // Subscribe to newsletter if requested
                if (request.Newsletter)
                {
                    await AddToNewsletter(request.CustomerInfo.Email, request.CustomerInfo.FirstName);
                }

                await _context.SaveChangesAsync();
                await transaction.CommitAsync();

                _logger.LogInformation($"Order {order.OrderNumber} created successfully for {request.CustomerInfo.Email}");

                return Ok(new CreateOrderResponse
                {
                    OrderId = order.OrderNumber,
                    Message = "Order placed successfully",
                    EstimatedDelivery = CalculateEstimatedDelivery(request.Shipping.Option)
                });
            }
            catch (Exception ex)
            {
                await transaction.RollbackAsync();
                _logger.LogError(ex, "Error creating order");
                return StatusCode(500, new { message = "An error occurred while processing your order" });
            }
        }

        [HttpGet("{orderNumber}")]
        public async Task<IActionResult> GetOrder(string orderNumber)
        {
            try
            {
                var order = await _context.Orders
                    .Include(o => o.OrderItems)
                    .ThenInclude(oi => oi.Product)
                    .Include(o => o.OrderItems)
                    .ThenInclude(oi => oi.Size)
                    .Include(o => o.User)
                    .FirstOrDefaultAsync(o => o.OrderNumber == orderNumber);

                if (order == null)
                    return NotFound(new { message = "Order not found" });

                return Ok(new OrderDetailsResponse
                {
                    OrderNumber = order.OrderNumber,
                    Status = order.Status,
                    PaymentStatus = order.PaymentStatus,
                    Total = order.TotalAmount,
                    Subtotal = order.SubTotal,
                    ShippingCost = order.ShippingCost,
                    Discount = order.Discount,
                    Tax = order.Tax,
                    OrderDate = order.OrderDate,
                    ShippedDate = order.ShippedDate,
                    DeliveredDate = order.DeliveredDate,
                    TrackingNumber = order.TrackingNumber,
                    CustomerName = $"{order.User.FirstName} {order.User.LastName}",
                    CustomerEmail = order.User.Email,
                    ShippingAddress = new OrderAddressResponse
                    {
                        FirstName = order.ShippingFirstName,
                        LastName = order.ShippingLastName,
                        AddressLine1 = order.ShippingAddressLine1,
                        AddressLine2 = order.ShippingAddressLine2,
                        City = order.ShippingCity,
                        State = order.ShippingState,
                        PostalCode = order.ShippingPostalCode,
                        Country = order.ShippingCountry,
                        Phone = order.ShippingPhone
                    },
                    Items = order.OrderItems.Select(oi => new OrderItemResponse
                    {
                        ProductId = oi.ProductId,
                        ProductName = oi.ProductName,
                        ProductColor = oi.ProductColor,
                        SizeName = oi.SizeName,
                        Quantity = oi.Quantity,
                        UnitPrice = oi.UnitPrice,
                        TotalPrice = oi.TotalPrice,
                        ImageUrl = oi.Product?.ImageUrl
                    }).ToList()
                });
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, $"Error retrieving order {orderNumber}");
                return StatusCode(500, new { message = "Error retrieving order" });
            }
        }

        [HttpPost("validate-promo")]
        public async Task<IActionResult> ValidatePromoCode([FromBody] PromoValidationRequest request)
        {
            try
            {
                var promo = await _context.DiscountCodes
                    .FirstOrDefaultAsync(d => d.Code == request.Code &&
                                            d.IsActive &&
                                            d.StartDate <= DateTime.UtcNow &&
                                            d.EndDate >= DateTime.UtcNow);

                if (promo == null)
                    return BadRequest(new { message = "Invalid or expired promo code" });

                if (promo.UsageLimit.HasValue && promo.UsageCount >= promo.UsageLimit)
                    return BadRequest(new { message = "Promo code usage limit exceeded" });

                if (promo.MinimumOrderAmount.HasValue && request.Subtotal < promo.MinimumOrderAmount)
                    return BadRequest(new { message = $"Minimum order amount of £{promo.MinimumOrderAmount} required" });

                var discountAmount = promo.DiscountType == "Percentage"
                    ? request.Subtotal * promo.DiscountValue / 100
                    : promo.DiscountValue;

                if (promo.MaximumDiscountAmount.HasValue && discountAmount > promo.MaximumDiscountAmount)
                    discountAmount = promo.MaximumDiscountAmount.Value;

                return Ok(new PromoValidationResponse
                {
                    Code = promo.Code,
                    Description = promo.Description,
                    DiscountType = promo.DiscountType,
                    DiscountValue = promo.DiscountValue,
                    DiscountAmount = discountAmount,
                    IsValid = true
                });
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, $"Error validating promo code {request.Code}");
                return StatusCode(500, new { message = "Error validating promo code" });
            }
        }

        private async Task<StockValidationResult> ValidateStockAvailability(List<CreateOrderItemRequest> items)
        {
            foreach (var item in items)
            {
                var productSize = await _context.ProductSizes
                    .Include(ps => ps.Product)
                    .FirstOrDefaultAsync(ps => ps.ProductId == item.ProductId && ps.SizeId == item.SizeId);

                if (productSize == null)
                    return new StockValidationResult
                    {
                        IsValid = false,
                        ErrorMessage = "Product size combination not found"
                    };

                if (!productSize.IsInStock || productSize.StockQuantity < item.Quantity)
                    return new StockValidationResult
                    {
                        IsValid = false,
                        ErrorMessage = $"Insufficient stock for {productSize.Product.Name}"
                    };
            }

            return new StockValidationResult { IsValid = true };
        }

        private async Task<OrderTotals> CalculateOrderTotals(List<CreateOrderItemRequest> items, ShippingRequest shipping, string promoCode)
        {
            var subtotal = items.Sum(item => item.Price * item.Quantity);

            // Calculate shipping cost
            var shippingCost = subtotal >= 50 ? 0 : GetShippingCost(shipping.Option);

            // Calculate tax (you can customize this based on your requirements)
            var tax = 0m; // VAT calculation if needed

            // Apply promo code discount
            var discount = 0m;
            if (!string.IsNullOrEmpty(promoCode))
            {
                var promo = await _context.DiscountCodes
                    .FirstOrDefaultAsync(p => p.Code == promoCode && p.IsActive);

                if (promo != null)
                {
                    discount = promo.DiscountType == "Percentage"
                        ? subtotal * promo.DiscountValue / 100
                        : promo.DiscountValue;

                    if (promo.MaximumDiscountAmount.HasValue && discount > promo.MaximumDiscountAmount)
                        discount = promo.MaximumDiscountAmount.Value;
                }
            }

            return new OrderTotals
            {
                Subtotal = subtotal,
                ShippingCost = shippingCost,
                Tax = tax,
                Discount = discount,
                Total = subtotal + shippingCost + tax - discount
            };
        }

        private decimal GetShippingCost(string shippingOption)
        {
            return shippingOption switch
            {
                "standard" => 3.99m,
                "express" => 5.99m,
                "next" => 9.99m,
                _ => 3.99m
            };
        }

        private async Task<Users> FindOrCreateUser(CustomerInfoRequest customerInfo)
        {
            var user = await _context.Users.FirstOrDefaultAsync(u => u.Email == customerInfo.Email);

            if (user == null)
            {
                user = new Users
                {
                    FirstName = customerInfo.FirstName,
                    LastName = customerInfo.LastName,
                    Email = customerInfo.Email,
                    PhoneNumber = customerInfo.Phone,
                    DateOfBirth = DateTime.MinValue, // Set default or request from frontend
                    CreatedAt = DateTime.UtcNow,
                    LastLoginAt = DateTime.UtcNow,
                    IsEmailVerified = false,
                    IsActive = true
                };

                _context.Users.Add(user);
                await _context.SaveChangesAsync();
            }

            return user;
        }

        private async Task UpdateStockQuantities(List<CreateOrderItemRequest> items)
        {
            foreach (var item in items)
            {
                var productSize = await _context.ProductSizes
                    .FirstOrDefaultAsync(ps => ps.ProductId == item.ProductId && ps.SizeId == item.SizeId);

                if (productSize != null)
                {
                    productSize.StockQuantity -= item.Quantity;
                    productSize.IsInStock = productSize.StockQuantity > 0;
                }
            }
        }

        private async Task UpdateDiscountCodeUsage(string promoCode)
        {
            var discount = await _context.DiscountCodes
                .FirstOrDefaultAsync(d => d.Code == promoCode);

            if (discount != null)
            {
                discount.UsageCount++;
            }
        }

        private async Task AddToNewsletter(string email, string firstName)
        {
            var existingSubscription = await _context.NewsletterSubscriptions
                .FirstOrDefaultAsync(n => n.Email == email);

            if (existingSubscription == null)
            {
                var subscription = new NewsletterSubscriptions
                {
                    Email = email,
                    FirstName = firstName,
                    IsActive = true,
                    SubscribedAt = DateTime.UtcNow,
                    Source = "Checkout"
                };

                _context.NewsletterSubscriptions.Add(subscription);
            }
        }

        private string GenerateOrderNumber()
        {
            return $"ORD{DateTime.UtcNow:yyyyMMdd}{Random.Shared.Next(1000, 9999)}";
        }

        private DateTime CalculateEstimatedDelivery(string shippingOption)
        {
            var businessDays = shippingOption switch
            {
                "standard" => 5,
                "express" => 2,
                "next" => 1,
                _ => 5
            };

            var deliveryDate = DateTime.UtcNow.AddDays(businessDays);

            // Skip weekends
            while (deliveryDate.DayOfWeek == DayOfWeek.Saturday || deliveryDate.DayOfWeek == DayOfWeek.Sunday)
            {
                deliveryDate = deliveryDate.AddDays(1);
            }

            return deliveryDate;
        }
    }

    // DTOs using your existing model structure
    public class CreateOrderRequest
    {
        [Required]
        public CustomerInfoRequest CustomerInfo { get; set; }

        [Required]
        public AddressRequest BillingAddress { get; set; }

        [Required]
        public AddressRequest ShippingAddress { get; set; }

        [Required]
        public List<CreateOrderItemRequest> Items { get; set; }

        [Required]
        public ShippingRequest Shipping { get; set; }

        public string? PromoCode { get; set; }

        [Required]
        [Range(0.01, double.MaxValue)]
        public decimal Total { get; set; }

        public bool CreateAccount { get; set; }
        public bool Newsletter { get; set; }
        public string? Notes { get; set; }
    }

    public class CustomerInfoRequest
    {
        [Required, EmailAddress]
        public string Email { get; set; }

        [Required]
        public string Phone { get; set; }

        [Required]
        public string FirstName { get; set; }

        [Required]
        public string LastName { get; set; }
    }

    public class AddressRequest
    {
        [Required]
        public string Address1 { get; set; }
        public string? Address2 { get; set; }

        [Required]
        public string City { get; set; }
        public string? County { get; set; }

        [Required]
        public string Postcode { get; set; }

        [Required]
        public string Country { get; set; }
    }

    public class CreateOrderItemRequest
    {
        [Required]
        public int ProductId { get; set; }

        [Required]
        public int SizeId { get; set; }

        [Required, Range(1, 10)]
        public int Quantity { get; set; }

        [Required, Range(0.01, double.MaxValue)]
        public decimal Price { get; set; }
    }

    public class ShippingRequest
    {
        [Required]
        public string Option { get; set; }

        [Required]
        public decimal Cost { get; set; }
    }

    public class PromoValidationRequest
    {
        [Required]
        public string Code { get; set; }

        [Required]
        public decimal Subtotal { get; set; }
    }

    public class CreateOrderResponse
    {
        public string OrderId { get; set; }
        public string Message { get; set; }
        public DateTime EstimatedDelivery { get; set; }
    }

    public class OrderDetailsResponse
    {
        public string OrderNumber { get; set; }
        public string Status { get; set; }
        public string PaymentStatus { get; set; }
        public decimal Total { get; set; }
        public decimal Subtotal { get; set; }
        public decimal ShippingCost { get; set; }
        public decimal Discount { get; set; }
        public decimal Tax { get; set; }
        public DateTime OrderDate { get; set; }
        public DateTime? ShippedDate { get; set; }
        public DateTime? DeliveredDate { get; set; }
        public string TrackingNumber { get; set; }
        public string CustomerName { get; set; }
        public string CustomerEmail { get; set; }
        public OrderAddressResponse ShippingAddress { get; set; }
        public List<OrderItemResponse> Items { get; set; }
    }

    public class OrderAddressResponse
    {
        public string FirstName { get; set; }
        public string LastName { get; set; }
        public string AddressLine1 { get; set; }
        public string AddressLine2 { get; set; }
        public string City { get; set; }
        public string State { get; set; }
        public string PostalCode { get; set; }
        public string Country { get; set; }
        public string Phone { get; set; }
    }

    public class OrderItemResponse
    {
        public int ProductId { get; set; }
        public string ProductName { get; set; }
        public string ProductColor { get; set; }
        public string SizeName { get; set; }
        public int Quantity { get; set; }
        public decimal UnitPrice { get; set; }
        public decimal TotalPrice { get; set; }
        public string ImageUrl { get; set; }
    }

    public class PromoValidationResponse
    {
        public string Code { get; set; }
        public string Description { get; set; }
        public string DiscountType { get; set; }
        public decimal DiscountValue { get; set; }
        public decimal DiscountAmount { get; set; }
        public bool IsValid { get; set; }
    }

    // Helper classes
    public class StockValidationResult
    {
        public bool IsValid { get; set; }
        public string ErrorMessage { get; set; }
    }

    public class OrderTotals
    {
        public decimal Subtotal { get; set; }
        public decimal ShippingCost { get; set; }
        public decimal Tax { get; set; }
        public decimal Discount { get; set; }
        public decimal Total { get; set; }
    }
}