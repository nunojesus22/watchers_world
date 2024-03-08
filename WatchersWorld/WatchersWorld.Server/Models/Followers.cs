using Microsoft.EntityFrameworkCore;
using System.ComponentModel.DataAnnotations;
using System.ComponentModel.DataAnnotations.Schema;
using WatchersWorld.Server.Models.Authentication;

namespace WatchersWorld.Server.Models
{
    public class Followers
    {
        [Key]
        public string FollowersId { get; set; }

        [ForeignKey(nameof(User.Id))]
        public string WhosFollowing { get; set; }

        [ForeignKey(nameof(User.Id))]
        public string WhosBeingFollowed { get; set; }
    }
}
