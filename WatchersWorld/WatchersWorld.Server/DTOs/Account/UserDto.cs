namespace WatchersWorld.Server.DTOs.Account
{
    /// <summary>
    /// DTO utilizado para representar um utilizador.
    /// Contém o token JWT, o nome de utilizador e o email.
    /// </summary>
    public class UserDto
    {
        /// <summary>
        /// Token JWT para autenticação e autorização.
        /// </summary>
        public string JWT { get; set; }

        /// <summary>
        /// Username do utilizador.
        /// </summary>
        public string Username { get; set; }

        /// <summary>
        /// Email do utilizador.
        /// </summary>
        public string Email { get; set; }
    }
}
