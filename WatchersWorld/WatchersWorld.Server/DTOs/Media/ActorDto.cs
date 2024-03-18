using System.ComponentModel.DataAnnotations;

namespace WatchersWorld.Server.DTOs.Media
{
    public class ActorDto
    {
        [Required]
        public int ActorId { get; set; }

        [Required]
        public string ActorName { get; set; }
    }
}
