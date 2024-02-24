using System.ComponentModel.DataAnnotations;

namespace WatchersWorld.Server.DTOs.Account
{
    /// <summary>
    /// Data Transfer Object (DTO) for confirming email.
    /// Used to transfer necessary data for email confirmation processes.
    /// </summary>
    public class ConfirmEmailDto
    {
        [Required]
        public string Token { get; set; }

        [Required(ErrorMessage = "O email é obrigatório!")]
        [EmailAddress(ErrorMessage = "A nomenclatura do email está incorreta!")]
        public string Email { get; set; }
    }
}
