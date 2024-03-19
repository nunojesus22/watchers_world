using System.ComponentModel.DataAnnotations;

namespace WatchersWorld.Server.DTOs.Account
{
    /// <summary>
    /// DTO utilizado para a reposição da palavra-passe de um utilizador.
    /// Contém a informação necessária para os processos de reposição da palavra-passe.
    /// </summary>
    public class ResetPasswordDto
    {
        /// <summary>
        /// Token fornecido para a verificação da reposição da palavra-passe.
        /// </summary>
        [Required]
        public string Token { get; set; }

        /// <summary>
        /// Endereço de email associado à conta do utilizador.
        /// </summary>
        [Required(ErrorMessage = "O email é obrigatório!")]
        [EmailAddress(ErrorMessage = "A nomenclatura do email está incorreta!")]
        public string Email { get; set; }

        /// <summary>
        /// Nova palavra-passe a ser definida para a conta do utilizador.
        /// </summary>
        [Required(ErrorMessage = "A nova palavra-passe é obrigatória!")]
        [StringLength(12, MinimumLength = 8, ErrorMessage = "A nova palavra-passe tem de conter entre 8-12 caracteres, entre eles pelo menos uma letra minúscula, uma letra maiúscula e um número!")]
        [RegularExpression("(?=.*[a-z])(?=.*[A-Z])(?=.*\\d).{8,}", ErrorMessage = "A nova palavra-passe tem de conter entre 8-12 caracteres, entre eles pelo menos uma letra minúscula, uma letra maiúscula e um número!")]
        public string NewPassword { get; set; }
    }
}
