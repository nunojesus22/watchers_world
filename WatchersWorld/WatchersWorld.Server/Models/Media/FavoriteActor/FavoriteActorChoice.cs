using System.ComponentModel.DataAnnotations;
using System.ComponentModel.DataAnnotations.Schema;
using WatchersWorld.Server.Models.Authentication;

namespace WatchersWorld.Server.Models.Media.FavoriteActor
{
    public class FavoriteActorChoice
    {
        [Key]
        public Guid Id { get; set; }

        [Required]
        [ForeignKey(nameof(User))]
        public string UserThatChooseId { get; set; }
        public virtual User User { get; set; }

        [Required]
        [ForeignKey(nameof(ActorMedia))]
        public Guid ActorMediaId { get; set; }
        public virtual ActorMedia ActorMedia { get; set; }

    }
}
