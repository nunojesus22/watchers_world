using System.ComponentModel.DataAnnotations.Schema;
using System.ComponentModel.DataAnnotations;
using WatchersWorld.Server.Models.Authentication;

namespace WatchersWorld.Server.Chat.Models
{
    public class MessagesVisibility
    {
        [Key]
        public Guid Id { get; set; }

        [Required]
        public string MessageId { get; set; }

        [ForeignKey("MessageId")]
        public virtual Messages Message { get; set; }


        [Required]
        public string UserId { get; set; }

        [ForeignKey("UserId")]
        public virtual User User { get; set; }

        public bool Visibility { get; set; }
    }
}
