using System.ComponentModel.DataAnnotations.Schema;
using System.ComponentModel.DataAnnotations;
using WatchersWorld.Server.Models.Authentication;

namespace WatchersWorld.Server.Models.Media
{
    public class CommentDislike
    {
        [Key]
        public int Id { get; set; }
        public int CommentId { get; set; }
        public string UserId { get; set; }

        [ForeignKey("CommentId")]
        public Comment Comment { get; set; }

        [ForeignKey("UserId")]
        public User User { get; set; }
    }
}

