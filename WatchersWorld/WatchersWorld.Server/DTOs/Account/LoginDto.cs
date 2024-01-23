using System.ComponentModel.DataAnnotations;

namespace WatchersWorld.Server.DTOs.Account
{
    // DTO (Data Transfer Object) for user login. 
    // This is used to transfer login data from the client to the server.
    public class LoginDto
    {
        [Required] // Specifies that UserName is a required field.
        public string UserName { get; set; }

        [Required] // Specifies that Password is a required field.
        public string Password { get; set; }
    }
}
