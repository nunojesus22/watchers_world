using System.ComponentModel.DataAnnotations;

namespace WatchersWorld.Server.Models.Media
{
    /// <summary>
    /// Representa uma lista de Media, permitindo agrupar diversas entidades de Media sob um nome comum.
    /// </summary>
    public class MediaListModel
    {
        /// <summary>
        /// Identificador único da lista de Media.
        /// </summary>
        [Key]
        public int Id { get; set; }

        /// <summary>
        /// Nome da lista de Media. Este campo representa o identificador textual pelo qual a lista é reconhecida e pode ser referenciada.
        /// </summary>
        public string ListName{ get; set; }

    }
}
