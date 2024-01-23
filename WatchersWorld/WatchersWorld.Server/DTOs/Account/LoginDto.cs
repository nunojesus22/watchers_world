using System.ComponentModel.DataAnnotations;

namespace WatchersWorld.Server.DTOs.Account
{
    // DTO (Data Transfer Object) for user login. 
    // This is used to transfer login data from the client to the server.
    public class LoginDto
    {
        [Required(ErrorMessage = "O email é obrigatório!")] // Specifies that Email is a required field.
        public string Email { get; set; }
        [Required(ErrorMessage = "A palavra-passe é obrigatória!")]
        public string Password { get; set; } // Specifies that Password is a required field.
    }
}
