using System.ComponentModel.DataAnnotations;

namespace WatchersWorld.Server.DTOs.Account
{
    public class RegisterDto
    {
        [Required]
        [StringLength(16, MinimumLength = 6, ErrorMessage = "Usermame must be at least {2}, and maximum {1} characters")]
        
        public string Username { get; set; }
        [Required]
        [RegularExpression("^\\w+@[a-zA-Z_]+?\\.[a-zA-Z]{2,3}$", ErrorMessage = "Invalid Email address")]
        public string Email { get; set; }
        [Required]
        [StringLength(16, MinimumLength = 8, ErrorMessage = "Password must be at least {2}, and maximum {1} characters")]
        public string Password { get; set; }
    }
}