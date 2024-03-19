using System.ComponentModel.DataAnnotations;
using System.ComponentModel.DataAnnotations.Schema;
using WatchersWorld.Server.Models.Authentication;

namespace WatchersWorld.Server.Models.Media.RatingMedia
{
    public class UserRatingMedia
    {
        [Key]
        public Guid Id { get; set; }

        [Required]
        public int Rating { get; set; }

        [Required]
        [ForeignKey(nameof(User))]
        public string UserThatRateId { get; set; }
        public virtual User User { get; set; }

        [Required]
        [ForeignKey(nameof(MediaInfo))]
        public int IdTableMedia { get; set; }
        public virtual MediaInfoModel MediaInfo { get; set; }
    }
}
