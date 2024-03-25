using System.ComponentModel.DataAnnotations;

namespace WatchersWorld.Server.DTOs.Account
{
    /// <summary>
    /// DTO utilizado para a confirmação de email.
    /// Contém o token de confirmação e o email do utilizador.
    /// </summary>
    public class ConfirmEmailDto
    {
        /// <summary>
        /// Token de confirmação de email.
        /// </summary>
        [Required]
        public string Token { get; set; }


        /// <summary>
        /// Email do utilizador a ser confirmado.
        /// </summary>
        [Required(ErrorMessage = "O email é obrigatório!")]
        [EmailAddress(ErrorMessage = "A nomenclatura do email está incorreta!")]
        public string Email { get; set; }
    }
}
