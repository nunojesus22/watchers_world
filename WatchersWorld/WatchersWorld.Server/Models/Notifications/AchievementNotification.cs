using System.ComponentModel.DataAnnotations.Schema;

namespace WatchersWorld.Server.Models.Notifications
{
    public class AchievementNotification : Notification
    {
        [ForeignKey("UserMedals")]
        public int UserMedalId { get; set; }

        public AchievementNotification()
        {
            EventType = "Achievement";
        }
    }
}
