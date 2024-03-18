using System.ComponentModel.DataAnnotations;
using System.ComponentModel.DataAnnotations.Schema;

namespace WatchersWorld.Server.Models.Media.FavoriteActor
{
    public class ActorMedia
    {
        [Key]
        public Guid Id { get; set; }

        [Required]
        [ForeignKey(nameof(Actor))]
        public int ActorId { get; set; }
        public virtual Actor Actor { get; set; }

        [Required]
        [ForeignKey(nameof(MediaInfo))]
        public int IdTableMedia { get; set; }
        public virtual MediaInfoModel MediaInfo { get; set; }

    }
}
