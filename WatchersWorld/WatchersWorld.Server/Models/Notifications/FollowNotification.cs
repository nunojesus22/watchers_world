using System.ComponentModel.DataAnnotations.Schema;
using WatchersWorld.Server.Models.Authentication;

namespace WatchersWorld.Server.Models.Notifications
{
    public class FollowNotification : Notification
    {
        [ForeignKey(nameof(User.Id))]
        public string TargetUserId { get; set; }

        /// <summary>
        /// Nome de usuário que desencadeou a notificação.
        /// </summary>
        public string TriggeredByUserPhoto { get; set; }

        public FollowNotification()
        {
            EventType = "NewFollower";
        }
    }
}
