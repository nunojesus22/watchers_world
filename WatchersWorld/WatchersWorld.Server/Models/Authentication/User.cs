using Microsoft.AspNetCore.Identity;
using System;
using System.ComponentModel.DataAnnotations;

namespace WatchersWorld.Server.Models.Authentication
{
    // Represents a user entity extending the IdentityUser class provided by ASP.NET Core Identity.
    // This class includes all basic user information like username, password, etc., and any additional properties specific to your application.
    public class User : IdentityUser
    {


        [Required]
        public string Provider { get; set; }

    }
}
