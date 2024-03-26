using System.ComponentModel.DataAnnotations;
using System.ComponentModel.DataAnnotations.Schema;
using WatchersWorld.Server.Models.Authentication;

namespace WatchersWorld.Server.Chat.Models
{
    public class Chat
    {
        [Key]
        public Guid Id { get; set; }

        [Required]
        public string User1Id { get; set; }

        [Required]
        public string User2Id { get; set; }

        [ForeignKey("User1Id")]
        public virtual User User1 { get; set; }

        [ForeignKey("User2Id")]
        public virtual User User2 { get; set; }

        [Required]
        public DateTime CreatedAt { get; set; }
    }
}
