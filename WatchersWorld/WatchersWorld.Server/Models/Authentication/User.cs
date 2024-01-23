using Microsoft.AspNetCore.Identity;
using System;
using System.ComponentModel.DataAnnotations;

namespace WatchersWorld.Server.Models.Authentication
{
    // Represents a user entity extending the IdentityUser class provided by ASP.NET Core Identity.
    // This class includes all basic user information like username, password, etc., and any additional properties specific to your application.
    public class User : IdentityUser
    {
        // A unique identifier for the user. Required attribute ensures this field is always populated.
        // Guid is used here to ensure that the identifier is globally unique.
        [Required]
        public Guid UserId { get; set; }
    }
}
