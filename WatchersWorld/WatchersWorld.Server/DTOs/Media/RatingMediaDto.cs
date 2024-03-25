
namespace WatchersWorld.Server.DTOs.Media
{
    /// <summary>
    /// DTO que representa a avaliação de uma Media por parte de um utilizador.
    /// Inclui a entidade de Media, a classificação atribuída e o nome de utilizador que efetuou a avaliação.
    /// </summary>
    public class RatingMediaDto
    {
        /// <summary>
        /// Informações sobre a peça de Media avaliada. Contém identificadores e outros dados relevantes da Media.
        /// </summary>
        public UserMediaDto Media { get; set; }

        /// <summary>
        /// A classificação atribuída à peça de Media pelo utilizador. Representa a opinião do utilizador sobre a qualidade da Media.
        /// </summary>
        public int Rating { get; set; }

        /// <summary>
        /// Nome de utilizador que efetuou a avaliação. Permite associar a avaliação a um perfil específico de utilizador.
        /// </summary>
        public string Username { get; set; }
    }
}
