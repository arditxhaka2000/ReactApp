using Microsoft.EntityFrameworkCore;
using ReactAppTest.Server;
using ReactAppTest.Server.Models;

var builder = WebApplication.CreateBuilder(args);

// Add services to the container.
builder.Services.AddControllers();
// Learn more about configuring Swagger/OpenAPI at https://aka.ms/aspnetcore/swashbuckle
builder.Services.AddEndpointsApiExplorer();
builder.Services.AddSwaggerGen();

builder.Services.AddDbContext<ApplicationDbContext>(options =>
    options.UseSqlServer(builder.Configuration.GetConnectionString("DefaultConnection")));

builder.Services.AddCors(options =>
{
    options.AddPolicy("AllowReact", policy =>
        policy.WithOrigins("https://localhost:54288", "http://localhost:54288") // Allow both HTTP and HTTPS
              .AllowAnyHeader()
              .AllowAnyMethod());
});

var app = builder.Build();

app.UseDefaultFiles();
app.UseStaticFiles();

// Configure the HTTP request pipeline.
if (app.Environment.IsDevelopment())
{
    app.UseSwagger();
    app.UseSwaggerUI();
}

app.UseHttpsRedirection();

// Use CORS after UseHttpsRedirection but before UseAuthorization
app.UseCors("AllowReact");

app.UseAuthorization();
app.MapControllers();
app.MapFallbackToFile("/index.html");

app.Run();