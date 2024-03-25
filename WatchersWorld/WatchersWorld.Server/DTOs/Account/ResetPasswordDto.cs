using System.ComponentModel.DataAnnotations;

namespace WatchersWorld.Server.DTOs.Account
{
    /// <summary>
    /// DTO for resetting a user's password.
    /// Contains the necessary information for password reset processes.
    /// </summary>
    public class ResetPasswordDto
    {
        /// <summary>
        /// Token provided for password reset verification.
        /// </summary>
        [Required]
        public string Token { get; set; }

        /// <summary>
        /// Email address associated with the user account.
        /// </summary>
        [Required(ErrorMessage = "O email é obrigatório!")]
        [EmailAddress(ErrorMessage = "A nomenclatura do email está incorreta!")]
        public string Email { get; set; }

        /// <summary>
        /// New password to be set for the user account.
        /// </summary>
        [Required(ErrorMessage = "A nova palavra-passe é obrigatória!")]
        [StringLength(12, MinimumLength = 8, ErrorMessage = "A nova palavra-passe tem de conter entre 8-12 caracteres, entre eles pelo menos uma letra minúscula, uma letra maiúscula e um número!")]
        [RegularExpression("(?=.*[a-z])(?=.*[A-Z])(?=.*\\d).{8,}", ErrorMessage = "A nova palavra-passe tem de conter entre 8-12 caracteres, entre eles pelo menos uma letra minúscula, uma letra maiúscula e um número!")]
        public string NewPassword { get; set; }
    }
}
