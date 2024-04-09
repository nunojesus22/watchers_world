using WatchersWorld.Server.Models.Gamification;

namespace WatchersWorld.Server.DTOs.Gamification
{
    /// <summary>
    /// Classe de transferência de dados (DTO) que representa os detalhes de uma medalha disponível na plataforma.
    /// Este DTO é utilizado para transferir informações sobre as medalhas entre camadas da aplicação,
    /// facilitando a comunicação de detalhes como nome, descrição e imagem da medalha sem expor a estrutura interna do modelo de dados.
    /// </summary>
    public class MedalsDto
    {
        /// <summary>
        /// Identificador único da medalha.
        /// Utilizado para referenciar de forma única cada medalha dentro da plataforma.
        /// </summary>
        public int Id { get; set; }

        /// <summary>
        /// Nome da medalha.
        /// O nome é utilizado para identificar a medalha de forma amigável aos utilizadores.
        /// </summary>
        public string Name { get; set; }

        /// <summary>
        /// Descrição da medalha.
        /// Fornece aos utilizadores informações sobre como a medalha pode ser obtida ou o significado da conquista.
        /// </summary>
        public string Description { get; set; }

        /// <summary>
        /// URL ou caminho para a imagem da medalha.
        /// A imagem é utilizada para representar visualmente a medalha em interfaces de utilizador, como perfis de utilizadores e listagens de conquistas.
        /// </summary>
        public string Image { get; set; }
    }
}
