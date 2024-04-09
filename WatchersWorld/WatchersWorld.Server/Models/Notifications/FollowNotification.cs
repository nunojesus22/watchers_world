using System.ComponentModel.DataAnnotations.Schema;
using WatchersWorld.Server.Models.Authentication;

namespace WatchersWorld.Server.Models.Notifications
{
    public class FollowNotification : Notification
    {
        [ForeignKey(nameof(User.Id))]
        public string TargetUserId { get; set; }


        public FollowNotification()
        {
            EventType = "NewFollower";
        }
    }
}
