using Microsoft.AspNetCore.Identity;
using System;
using System.ComponentModel.DataAnnotations;

namespace WatchersWorld.Server.Models.Authentication
{
    /// <summary>
    /// Represents a user entity extending the IdentityUser class provided by ASP.NET Core Identity.
    /// Includes basic user information and additional properties specific to the application.
    /// </summary>
    public class User : IdentityUser
    {


        [Required]
        public string Provider { get; set; }

    }
}
