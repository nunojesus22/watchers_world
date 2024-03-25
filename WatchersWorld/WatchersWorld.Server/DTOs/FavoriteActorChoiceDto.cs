using WatchersWorld.Server.DTOs.Media;

namespace WatchersWorld.Server.DTOs
{
    /// <summary>
    /// DTO utilizado para representar a escolha de um ator favorito por parte de um utilizador, incluindo detalhes da Media, o identificador da escolha, o elenco da Media e o nome de utilizador.
    /// </summary>
    public class FavoriteActorChoiceDto
    {
        /// <summary>
        /// Informações sobre a Media associada à escolha do ator favorito.
        /// </summary>
        public UserMediaDto Media { get; set; }

        /// <summary>
        /// Identificador único da escolha do ator favorito.
        /// </summary>
        public int ActorChoiceId { get; set; }

        /// <summary>
        /// Lista representando o elenco da Media.
        /// </summary>
        public List<ActorDto> MediaCast {  get; set; }

        /// <summary>
        /// Username do utilizador que fez a escolha do ator favorito.
        /// </summary>
        public string Username { get; set; }
    }
}
