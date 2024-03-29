using System.ComponentModel.DataAnnotations.Schema;
using WatchersWorld.Server.Models.Authentication;
using WatchersWorld.Server.Models.Media;

namespace WatchersWorld.Server.Models.Notifications
{
    public class ReplyNotification : Notification
    {
        [ForeignKey("MediaInfoModel")]
        public int IdTableMedia { get; set; }

        [ForeignKey("Comment")]
        public int IdComment { get; set; }

        [ForeignKey(nameof(User.Id))]
        public string TargetUserId { get; set; }

        public ReplyNotification()
        {
            EventType = "Reply";
        }
    }
}
