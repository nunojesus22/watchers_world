using System.ComponentModel.DataAnnotations;

namespace WatchersWorld.Server.DTOs.Account
{
    /// <summary>
    /// DTO utilizado para o login de utilizador.
    /// Serve para transferir dados de login do cliente para o servidor.
    /// </summary>
    public class LoginDto
    {
        /// <summary>
        /// Endereço de email do utilizador.
        /// </summary>
        [Required(ErrorMessage = "O email é obrigatório!")]
        [EmailAddress(ErrorMessage = "A nomenclatura do email está incorreta!")]
        public string Email { get; set; }

        /// <summary>
        /// Palavra-passe do utilizador.
        /// </summary>
        [Required(ErrorMessage = "A palavra-passe é obrigatória!")]
        [StringLength(12, ErrorMessage = "A palavra-passe tem de conter entre {2}-{1} caracteres, entre eles pelo menos uma letra minúscula, uma letra maiúscula e um número!", MinimumLength = 8)]
        [RegularExpression(@"^(?=.*[a-z])(?=.*[A-Z])(?=.*\d).{8,12}$", ErrorMessage = "A palavra-passe tem de conter entre 8-12 caracteres, entre eles pelo menos uma letra minúscula, uma letra maiúscula e um número!")]
        public string Password { get; set; }
    }
}
