using System.ComponentModel.DataAnnotations;
using System.ComponentModel.DataAnnotations.Schema;
using WatchersWorld.Server.Models.Authentication;

namespace WatchersWorld.Server.Models.Media
{

    public class Comment
    {
        public int Id { get; set; }
        public string UserId { get; set; }
        public int MediaId { get; set; } // Isto deve corresponder ao IdMedia na tabela MediaInfoModel
        public string Text { get; set; }
        public DateTime CreatedAt { get; set; }

        public User User { get; set; }

        // Esta é a parte importante: garantir que a chave estrangeira esteja configurada corretamente
        [ForeignKey("IdTableMedia")]
        public MediaInfoModel Media { get; set; }

        public ICollection<CommentLike> Likes { get; set; }
        public ICollection<CommentDislike> Dislikes { get; set; }
    }

}
