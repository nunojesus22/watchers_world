namespace WatchersWorld.Server.DTOs.Media
{
    /// <summary>
    /// DTO que representa uma entidade de Media associada a um utilizador.
    /// Inclui o identificador da Media e o seu tipo.
    /// </summary>
    public class UserMediaDto
    {
        /// <summary>
        /// Identificador da Media.
        /// </summary>
        public int MediaId { get; set; }

        /// <summary>
        /// Tipo da Media.
        /// </summary>
        public string Type { get; set; }
    }

}
