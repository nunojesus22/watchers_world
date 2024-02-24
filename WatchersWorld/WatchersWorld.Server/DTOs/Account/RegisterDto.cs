using System.ComponentModel.DataAnnotations;

namespace WatchersWorld.Server.DTOs.Account
{
    /// <summary>
    /// DTO for user registration.
    /// Used to transfer registration data from the client to the server.
    /// </summary>
    public class RegisterDto
    {
        /// <summary>
        /// Username for the new user account.
        /// </summary>
        [Required(ErrorMessage = "O nome de utilizador é obrigatório!")]
        [StringLength(20, MinimumLength = 4, ErrorMessage = "O nome de utilizador tem de conter entre 4-20 caracteres!")]
        public string Username { get; set; }

        /// <summary>
        /// Email address for the new user account.
        /// </summary>
        [Required(ErrorMessage = "O email é obrigatório!")]
        [EmailAddress(ErrorMessage = "A nomenclatura do email está incorreta!")]
        public string Email { get; set; }

        /// <summary>
        /// Password for the new user account.
        /// </summary>
        [Required(ErrorMessage = "A palavra-passe é obrigatória!")]
        [StringLength(12, MinimumLength = 8, ErrorMessage = "A palavra-passe tem de conter entre 8-12 caracteres, entre eles pelo menos uma letra minúscula, uma letra maiúscula e um número!")]
        [RegularExpression("(?=.*[a-z])(?=.*[A-Z])(?=.*\\d).{8,}", ErrorMessage = "A palavra-passe tem de conter entre 8-12 caracteres, entre eles pelo menos uma letra minúscula, uma letra maiúscula e um número!")]
        public string Password { get; set; }
    }
}