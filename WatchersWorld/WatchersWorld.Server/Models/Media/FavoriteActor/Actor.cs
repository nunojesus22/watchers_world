using System.ComponentModel.DataAnnotations;

namespace WatchersWorld.Server.Models.Media.FavoriteActor
{
    public class Actor
    {
        [Required]
        [Key]
        public int ActorId { get; set; }

        [Required]
        public string ActorName { get; set; }
    }
}
