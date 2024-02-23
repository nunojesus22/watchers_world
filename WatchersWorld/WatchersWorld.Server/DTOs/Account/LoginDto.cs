using System.ComponentModel.DataAnnotations;

namespace WatchersWorld.Server.DTOs.Account
{
    /// <summary>
    /// DTO for user login.
    /// Used to transfer login data from the client to the server.
    /// </summary>
    public class LoginDto
    {
        /// <summary>
        /// Email address of the user.
        /// </summary>
        [Required(ErrorMessage = "O email é obrigatório!")]
        [EmailAddress(ErrorMessage = "A nomenclatura do email está incorreta!")]
        public string Email { get; set; }

        /// <summary>
        /// Password of the user.
        /// </summary>
        [Required(ErrorMessage = "A palavra-passe é obrigatória!")]
        [StringLength(12, ErrorMessage = "A palavra-passe tem de conter entre {2}-{1} caracteres, entre eles pelo menos uma letra minúscula, uma letra maiúscula e um número!", MinimumLength = 8)]
        [RegularExpression(@"^(?=.*[a-z])(?=.*[A-Z])(?=.*\d).{8,12}$", ErrorMessage = "A palavra-passe tem de conter entre 8-12 caracteres, entre eles pelo menos uma letra minúscula, uma letra maiúscula e um número!")]
        public string Password { get; set; }
    }
}
