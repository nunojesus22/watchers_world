using Microsoft.AspNetCore.Identity;
using System.ComponentModel.DataAnnotations;

namespace WatchersWorld.Server.Models.Authentication
{
    /// <summary>
    /// Representa uma entidade de utilizador que estende a classe IdentityUser fornecida pelo ASP.NET Core Identity.
    /// Inclui informações básicas do utilizador e propriedades adicionais específicas à aplicação.
    /// </summary>
    public class User : IdentityUser
    {
        /// <summary>
        /// Fornecedor utilizado pelo utilizador para se registar ou autenticar na aplicação.
        /// </summary>
        [Required]
        public string Provider { get; set; }
    }
}
