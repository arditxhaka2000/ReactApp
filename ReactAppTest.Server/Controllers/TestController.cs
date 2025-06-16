using Microsoft.AspNetCore.Mvc;

namespace ReactAppTest.Server.Controllers
{
    [ApiController]
    [Route("[controller]")]
    public class TestController : ControllerBase
    {
        [HttpGet]
        public IActionResult Get()
        {
            return Ok(new { message = "Hello from C# backend!" });
        }
    }
}
