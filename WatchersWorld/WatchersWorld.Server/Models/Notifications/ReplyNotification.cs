using System.ComponentModel.DataAnnotations.Schema;
using WatchersWorld.Server.Models.Authentication;

namespace WatchersWorld.Server.Models.Notifications
{
    public class ReplyNotification : Notification
    {
        public int MediaId { get; set; }
        public int CommentId { get; set; }

        [ForeignKey(nameof(User.Id))]
        public string TargetUserId { get; set; }

        /// <summary>
        /// Nome de usuário que desencadeou a notificação.
        /// </summary>
        public string TriggeredByUserPhoto { get; set; }

        public ReplyNotification()
        {
            EventType = "Reply";
        }
    }
}
