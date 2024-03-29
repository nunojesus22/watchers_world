namespace WatchersWorld.Server.Models.Notifications
{
    public class AchievementNotification : Notification
    {
        public string AchievementName { get; set; }

        public AchievementNotification()
        {
            EventType = "Achievement";
        }
    }
}
