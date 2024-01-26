using System.ComponentModel.DataAnnotations;

namespace WatchersWorld.Server.DTOs.Account
{
    // DTO (Data Transfer Object) for user login. 
    // This is used to transfer login data from the client to the server.
    public class LoginDto
    {
        /// <summary>
        ///     This API supports the ASP.NET Core Identity default UI infrastructure and is not intended to be used
        ///     directly from your code. This API may change or be removed in future releases.
        /// </summary>
        [Required(ErrorMessage = "O email é obrigatório!")]
        [EmailAddress(ErrorMessage = "A nomenclatura do email está incorreta!")]
        public string Email { get; set; }

        /// <summary>
        ///     This API supports the ASP.NET Core Identity default UI infrastructure and is not intended to be used
        ///     directly from your code. This API may change or be removed in future releases.
        /// </summary>
        [Required(ErrorMessage = "A palavra-passe é obrigatória!")]
        [StringLength(12, ErrorMessage = "A palavra-passe tem de conter entre {2}-{1} caracteres, entre eles pelo menos uma letra minúscula, uma letra maiúscula e um número!", MinimumLength = 8)]
        [RegularExpression(@"^(?=.*[a-z])(?=.*[A-Z])(?=.*\d).{8,12}$", ErrorMessage = "A palavra-passe tem de conter entre 8-12 caracteres, entre eles pelo menos uma letra minúscula, uma letra maiúscula e um número!")]
        public string Password { get; set; }
    }
}
