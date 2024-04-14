using System.ComponentModel.DataAnnotations;
using System.ComponentModel.DataAnnotations.Schema;
using WatchersWorld.Server.Models.Authentication;

namespace WatchersWorld.Server.Models.Media
{
    /// <summary>
    /// Representa um comentário feito em uma mídia.
    /// </summary>
    public class Comment
    {

        /// <summary>
        /// O ID do comentário.
        /// </summary>
        public int Id { get; set; }

        /// <summary>
        /// O ID do utilizador que fez o comentário.
        /// </summary>
        public string UserId { get; set; }

        /// <summary>
        /// O ID da mídia à qual o comentário está associado.
        /// </summary>
        public int MediaId { get; set; } 


        /// <summary>
        /// O texto do comentário.
        /// </summary>
        public string Text { get; set; }

        /// <summary>
        /// A data e hora em que o comentário foi criado.
        /// </summary>
        public DateTime CreatedAt { get; set; }


        /// <summary>
        /// O utilizador que fez o comentário.
        /// </summary>
        public User User { get; set; }

        /// <summary>
        /// A mídia à qual o comentário está associado.
        /// </summary>
        [ForeignKey("IdTableMedia")]
        public MediaInfoModel Media { get; set; }


        /// <summary>
        /// As curtidas recebidas pelo comentário.
        /// </summary>
        public ICollection<CommentLike> Likes { get; set; }
        
        /// <summary>
        /// As descurtidas recebidas pelo comentário.
        /// </summary>
        public ICollection<CommentDislike> Dislikes { get; set; }

        /// <summary>
        /// O ID do comentário pai, se este comentário for uma resposta a outro comentário.
        /// </summary>
        public int? ParentCommentId { get; set; } // Adicione isto para suportar respostas


        /// <summary>
        /// O comentário pai, se este comentário for uma resposta a outro comentário.
        /// </summary>
        public Comment ParentComment { get; set; } // Adicione isto para referenciar o comentário pai
        
        /// <summary>
        /// As respostas a este comentário, se houverem.
        /// </summary>
        public ICollection<Comment> Replies { get; set; } // Adicione isto para listar as respostas
    }

}
