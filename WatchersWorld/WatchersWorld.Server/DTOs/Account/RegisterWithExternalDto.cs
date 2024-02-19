using System.ComponentModel.DataAnnotations;

namespace WatchersWorld.Server.DTOs.Account
{
    public class RegisterWithExternalDto
    {
        [Required(ErrorMessage = "O nome de utilizador é obrigatório!")]
        [StringLength(20, MinimumLength = 4, ErrorMessage = "O nome de utilizador tem de conter entre 4-20 caracteres!")]

        public string Username { get; set; }

        [Required]
        public string AccessToken { get; set; }
        
        [Required]
        public string UserId { get; set; }

        [Required]

        public string Provider {  get; set; }

        [Required]
        public string Email { get; set; }

    }
}
