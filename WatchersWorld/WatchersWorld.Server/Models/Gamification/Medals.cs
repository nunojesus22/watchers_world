using System.ComponentModel.DataAnnotations;
using System.ComponentModel.DataAnnotations.Schema;

namespace WatchersWorld.Server.Models.Gamification
{
    /// <summary>
    /// Classe que representa uma medalha na plataforma.
    /// As medalhas são recompensas atribuídas aos utilizadores por alcançarem certos marcos ou completarem tarefas específicas.
    /// Esta classe destina-se a capturar e transmitir informações sobre as medalhas disponíveis.
    /// </summary>
    public class Medals
    {
        /// <summary>
        /// Identificador único da medalha.
        /// Utilizado internamente para referenciar uma medalha específica.
        /// </summary>
        [Key]
        public int Id { get; set; }

        /// <summary>
        /// Nome da medalha.
        /// Este nome é exibido aos utilizadores e ajuda a identificar a medalha.
        /// </summary>
        [Required]
        public string Name { get; set; }

        /// <summary>
        /// Descrição da medalha.
        /// Fornece informações sobre como a medalha pode ser obtida ou o que ela representa.
        /// </summary>
        [Required]
        public string Description { get; set; }

        /// <summary>
        /// URL ou caminho para a imagem representativa da medalha.
        /// A imagem é utilizada para exibição visual da medalha nos perfis dos utilizadores ou em listagens de recompensas.
        /// </summary>
        [Required]
        public string Image { get; set; }
    }
}
