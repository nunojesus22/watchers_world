using System.ComponentModel.DataAnnotations;
using System.ComponentModel.DataAnnotations.Schema;
using WatchersWorld.Server.Models.Authentication;

namespace WatchersWorld.Server.Models.Media.RatingMedia
{
    /// <summary>
    /// Representa a avaliação de um item de Media por um utilizador, associando uma classificação numérica à combinação utilizador-Media.
    /// </summary>
    public class UserRatingMedia
    {
        /// <summary>
        /// Identificador único da avaliação.
        /// </summary>
        [Key]
        public Guid Id { get; set; }

        /// <summary>
        /// Avaliação atribuída pelo utilizador ao item de Media. Valor numérico que representa a classificação.
        /// </summary>
        [Required]
        public int Rating { get; set; }

        /// <summary>
        /// Identificador do utilizador que efetuou a avaliação. Chave estrangeira que referencia a entidade User.
        /// </summary>
        [Required]
        [ForeignKey(nameof(User))]
        public string UserThatRateId { get; set; }
        public virtual User User { get; set; }

        /// <summary>
        /// Identificador da informação de Media avaliada. Chave estrangeira que referencia a entidade MediaInfoModel.
        /// </summary>
        [Required]
        [ForeignKey(nameof(MediaInfo))]
        public int IdTableMedia { get; set; }
        public virtual MediaInfoModel MediaInfo { get; set; }
    }
}
