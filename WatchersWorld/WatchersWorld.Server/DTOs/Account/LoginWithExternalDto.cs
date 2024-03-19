using System.ComponentModel.DataAnnotations;

namespace WatchersWorld.Server.DTOs.Account
{
    /// <summary>
    /// DTO utilizado para login com serviços externos.
    /// Contém o token de acesso, identificador do utilizador, provedor do serviço e o email do utilizador.
    /// </summary>
    public class LoginWithExternalDto
    {
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
        public string Provider { get; set; }

        /// <summary>
        /// Email do utilizador.
        /// </summary>
        [Required]
        public string Email { get; set; }
    }
}
