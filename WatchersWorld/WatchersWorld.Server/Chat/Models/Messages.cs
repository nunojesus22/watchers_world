using System.ComponentModel.DataAnnotations;
using System.ComponentModel.DataAnnotations.Schema;
using WatchersWorld.Server.Models.Authentication;

namespace WatchersWorld.Server.Chat.Models
{
    public class Messages
    {

        [Key]
        public string Id { get; set; }

        [Required]
        public Guid ChatId { get; set; }

        [ForeignKey("ChatId")]
        public virtual Chat Chat { get; set; }

        [Required]
        public string SendUserId { get; set; }

        [ForeignKey("SendUserId")]
        public virtual User SendUser { get; set; }

        [Required]
        public string Text { get; set; }

        [Required]
        public DateTime SentAt { get; set; }
    }
}
