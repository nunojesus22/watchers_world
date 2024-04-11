using System.ComponentModel.DataAnnotations.Schema;
using System.ComponentModel.DataAnnotations;
using WatchersWorld.Server.Models.Authentication;

namespace WatchersWorld.Server.Models.Media
{
    /// <summary>
    /// Representa um registro de descurtida em um comentário.
    /// </summary>
    public class CommentDislike
    {
        /// <summary>
        /// O ID da descurtida.
        /// </summary>
        [Key]
        public int Id { get; set; }

        /// <summary>
        /// O ID do comentário que recebeu a descurtida.
        /// </summary>

        public int CommentId { get; set; }
        
        
        /// <summary>
        /// O ID do usuário que deu a descurtida.
        /// </summary>
        public string UserId { get; set; }

        
        /// <summary>
        /// O comentário que recebeu a descurtida.
        /// </summary>
        [ForeignKey("CommentId")]
        public Comment Comment { get; set; }

        
        /// <summary>
        /// O usuário que deu a descurtida.
        /// </summary>
        [ForeignKey("UserId")]
        public User User { get; set; }
    }
}

