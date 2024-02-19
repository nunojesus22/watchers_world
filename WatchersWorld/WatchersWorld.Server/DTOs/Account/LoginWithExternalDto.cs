using System.ComponentModel.DataAnnotations;

namespace WatchersWorld.Server.DTOs.Account
{
    public class LoginWithExternalDto
    {
        [Required]
        public string AcessToken { get; set; }

        [Required]
        public string UserId { get; set; }

        [Required]

        public string Provider { get; set; }

        [Required]
        public string Email { get; set; }
    }
}
