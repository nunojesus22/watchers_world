using System.ComponentModel.DataAnnotations.Schema;
using System.ComponentModel.DataAnnotations;
using WatchersWorld.Server.Models.Authentication;

namespace WatchersWorld.Server.Models.Media
{
    /// <summary>
    /// Representa um registro de curtida em um comentário.
    /// </summary>
    public class CommentLike

    {
        /// <summary>
        /// O ID da curtida.
        /// </summary>
        [Key]
        public int Id { get; set; }

        /// <summary>
        /// O ID do comentário que recebeu a curtida.
        /// </summary>
        public int CommentId { get; set; }
        
        /// <summary>
        /// O ID do utilizador que deu a curtida.
        /// </summary>
        public string UserId { get; set; }

        
        /// <summary>
        /// O comentário que recebeu a curtida.
        /// </summary>
        [ForeignKey("CommentId")]
        public virtual Comment Comment { get; set; }

        /// <summary>
        /// O utilizador que deu a curtida.
        /// </summary>
        [ForeignKey("UserId")]
        public virtual User User { get; set;}
    }
}
