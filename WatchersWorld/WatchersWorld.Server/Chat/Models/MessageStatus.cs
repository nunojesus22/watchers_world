using System.ComponentModel.DataAnnotations;
using System.ComponentModel.DataAnnotations.Schema;
using WatchersWorld.Server.Models.Authentication;

namespace WatchersWorld.Server.Chat.Models
{
    public class MessageStatus
    {
        [Key]
        [Required]
        public string MessageId { get; set; }

        [ForeignKey("MessageId")]
        public virtual Messages Message { get; set; }


        [Required]
        public string RecipientUserId { get; set; }

        [ForeignKey("RecipientUserId")]
        public virtual User RecipientUser { get; set; }

        public DateTime? ReadAt { get; set; }
    }
}
