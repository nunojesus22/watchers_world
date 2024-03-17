using Microsoft.EntityFrameworkCore;
using System.ComponentModel.DataAnnotations;
using System.ComponentModel.DataAnnotations.Schema;
using WatchersWorld.Server.Models.Authentication;

namespace WatchersWorld.Server.Models.Followers
{
    public class Followers
    {
        [Key]
        public Guid FollowersId { get; set; }

        [ForeignKey(nameof(User.Id))]
        public string WhosFollowing { get; set; }

        [ForeignKey(nameof(User.Id))]
        public string WhosBeingFollowed { get; set; }

        public bool IsApproved { get; set; }
    }
}
