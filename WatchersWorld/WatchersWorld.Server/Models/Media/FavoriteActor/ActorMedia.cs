using System.ComponentModel.DataAnnotations;
using System.ComponentModel.DataAnnotations.Schema;

namespace WatchersWorld.Server.Models.Media.FavoriteActor
{
    /// <summary>
    /// Associação entre um ator e uma Media, permitindo relacionar atores específicos com itens de Media.
    /// </summary>
    public class ActorMedia
    {
        /// <summary>
        /// Identificador único da associação.
        /// </summary>
        [Key]
        public Guid Id { get; set; }

        /// <summary>
        /// Identificador do ator associado. Chave estrangeira que referencia a entidade Actor.
        /// </summary>
        [Required]
        [ForeignKey(nameof(Actor))]
        public int ActorId { get; set; }
        public virtual Actor Actor { get; set; }

        /// <summary>
        /// Identificador da informação de Media associada. Chave estrangeira que referencia a entidade MediaInfoModel.
        /// </summary>
        [Required]
        [ForeignKey(nameof(MediaInfo))]
        public int IdTableMedia { get; set; }
        public virtual MediaInfoModel MediaInfo { get; set; }

    }
}
