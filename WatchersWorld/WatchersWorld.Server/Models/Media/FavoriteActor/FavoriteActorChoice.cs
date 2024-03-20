using System.ComponentModel.DataAnnotations;
using System.ComponentModel.DataAnnotations.Schema;
using WatchersWorld.Server.Models.Authentication;

namespace WatchersWorld.Server.Models.Media.FavoriteActor
{
    /// <summary>
    /// Representa a escolha de um ator favorito por parte de um utilizador, associando o utilizador a um par ator-Media.
    /// </summary>
    public class FavoriteActorChoice
    {
        /// <summary>
        /// Identificador único da escolha.
        /// </summary>
        [Key]
        public Guid Id { get; set; }

        /// <summary>
        /// Identificador do utilizador que fez a escolha. Chave estrangeira que referencia a entidade User.
        /// </summary>
        [Required]
        [ForeignKey(nameof(User))]
        public string UserThatChooseId { get; set; }
        public virtual User User { get; set; }

        /// <summary>
        /// Identificador da associação ator-Media escolhida. Chave estrangeira que referencia a entidade ActorMedia.
        /// </summary>
        [Required]
        [ForeignKey(nameof(ActorMedia))]
        public Guid ActorMediaId { get; set; }
        public virtual ActorMedia ActorMedia { get; set; }

    }
}
