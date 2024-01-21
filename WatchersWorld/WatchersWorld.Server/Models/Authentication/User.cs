using Microsoft.AspNetCore.Identity;
using System;
using System.ComponentModel.DataAnnotations;

namespace WatchersWorld.Server.Models.Authentication
{
    public class User : IdentityUser
    {
        [Required]
        public Guid UserId { get; set; }
    }
}
