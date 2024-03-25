using System.ComponentModel.DataAnnotations.Schema;
using System.ComponentModel.DataAnnotations;
using WatchersWorld.Server.Models.Authentication;

namespace WatchersWorld.Server.Models.Media
{
    public class CommentLike

    {

        [Key]
        public int Id { get; set; }
        public int CommentId { get; set; }
        public string UserId { get; set; }

        [ForeignKey("CommentId")]
        public virtual Comment Comment { get; set; }

        [ForeignKey("UserId")]
        public virtual User User { get; set;}
    }
}
