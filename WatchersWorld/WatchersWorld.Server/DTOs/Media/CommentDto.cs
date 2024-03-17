using WatchersWorld.Server.Models.Media;

namespace WatchersWorld.Server.DTOs.Media
{
    public class CommentDto
    {
        public int Id { get; set; }
        public string UserName { get; set; }
        public int MediaId { get; set; }
        public string Text { get; set; }
        public DateTime CreatedAt { get; set; }
        public string ProfilePhoto { get; set; } 
        public int LikesCount { get; set; }
        public int DislikesCount { get; set; }

        public bool HasLiked { get; set; }
        public bool HasDisliked { get; set; }

        public int? ParentCommentId { get; set; } // Adicione isto para suportar respostas

        public Comment ParentComment { get; set; } // Adicione isto para referenciar o comentário pai
        public ICollection<CommentDto> Replies { get; set; } // Isto está correto
    }
}
