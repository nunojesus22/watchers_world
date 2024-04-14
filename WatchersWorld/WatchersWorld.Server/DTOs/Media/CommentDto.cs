using WatchersWorld.Server.Models.Media;

namespace WatchersWorld.Server.DTOs.Media
{
    /// <summary>
    /// DTO (Data Transfer Object) que representa um comentário em uma mídia.
    /// </summary>
    public class CommentDto
    {
        /// <summary>
        /// O ID do comentário.
        /// </summary>
        public int Id { get; set; }

        /// <summary>
        /// O nome de utilizador do autor do comentário.
        /// </summary>
        public string UserName { get; set; }


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
        /// O URL da foto de perfil do autor do comentário.
        /// </summary>
        public string ProfilePhoto { get; set; } 

        
        /// <summary>
        /// O número de curtidas que o comentário recebeu.
        /// </summary>
        public int LikesCount { get; set; }


        /// <summary>
        /// O número de descurtidas que o comentário recebeu.
        /// </summary>
        public int DislikesCount { get; set; }
    

        /// <summary>
        /// Indica se o utilizador atual curtiu o comentário.
        /// </summary>
        public bool HasLiked { get; set; }

        /// <summary>
        /// Indica se o utilizador atual descurtiu o comentário.
        /// </summary>
        public bool HasDisliked { get; set; }


        /// <summary>
        /// O ID do comentário pai, se este comentário for uma resposta a outro comentário.
        /// </summary>
        public int? ParentCommentId { get; set; } 

        /// <summary>
        /// O comentário pai, se este comentário for uma resposta a outro comentário.
        /// </summary>
        public Comment ParentComment { get; set; } 

         /// <summary>
        /// As respostas a este comentário, se houverem.
        /// </summary>
        public ICollection<CommentDto> Replies { get; set; } 
    }
}
