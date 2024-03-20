using System.ComponentModel.DataAnnotations;

namespace WatchersWorld.Server.DTOs.Account
{
    /// <summary>
    /// DTO utilizado para o registo com serviços externos.
    /// Inclui o nome de utilizador, token de acesso, identificador do utilizador, provedor do serviço e o email.
    /// </summary>
    public class RegisterWithExternalDto
    {
        /// <summary>
        /// Username do utilizador.
        /// </summary>
        [Required(ErrorMessage = "O nome de utilizador é obrigatório!")]
        [StringLength(20, MinimumLength = 4, ErrorMessage = "O nome de utilizador tem de conter entre 4-20 caracteres!")]
        public string Username { get; set; }

        /// <summary>
        /// Token de acesso fornecido pelo serviço externo.
        /// </summary>
        [Required]
        public string AccessToken { get; set; }

        /// <summary>
        /// Identificador do utilizador no serviço externo.
        /// </summary>
        [Required]
        public string UserId { get; set; }

        /// <summary>
        /// Provedor do serviço externo (ex: Google).
        /// </summary>
        [Required]
        public string Provider {  get; set; }

        /// <summary>
        /// Email do utilizador.
        /// </summary>
        [Required]
        public string Email { get; set; }

    }
}
