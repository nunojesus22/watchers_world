namespace WatchersWorld.Server.DTOs
{
    /// <summary>
    /// DTO (Data Transfer Object) utilizado para transmitir informações de seguidores, incluindo nome de utilizador e fotografia de perfil.
    /// </summary>
    public class FollowerDto
    {
        /// <summary>
        /// Nome de utilizador do seguidor.
        /// </summary>
        public string Username { get; set; }

        /// <summary>
        /// Caminho ou URL para a fotografia de perfil do seguidor.
        /// </summary>
        public string ProfilePhoto { get; set; }
    }
}
