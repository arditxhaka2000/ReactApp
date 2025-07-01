// Create this file: Attributes/AdminAuthorizeAttribute.cs
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using Microsoft.AspNetCore.Mvc.Filters;
using System.Security.Claims;

namespace ReactAppTest.Server.Attributes
{
    public class AdminAuthorizeAttribute : Attribute, IAuthorizationFilter
    {
        public void OnAuthorization(AuthorizationFilterContext context)
        {
            // Check if user is authenticated
            if (!context.HttpContext.User.Identity.IsAuthenticated)
            {
                context.Result = new UnauthorizedResult();
                return;
            }

            // Check if user has admin role
            var isAdmin = context.HttpContext.User.FindFirst("isAdmin")?.Value == "True";
            var role = context.HttpContext.User.FindFirst("role")?.Value;

            if (!isAdmin && role != "Admin" && role != "SuperAdmin")
            {
                context.Result = new ForbidResult();
                return;
            }
        }
    }
}