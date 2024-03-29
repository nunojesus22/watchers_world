namespace WatchersWorld.Server.DTOs.Notifications
{
    /// <summary>
    /// Representa os dados transferidos para uma notificação de conquista.
    /// </summary>
    public class AchievementNotificationDto : NotificationDto
    {
        /// <summary>
        /// Nome da conquista.
        /// </summary>
        public string AchievementName { get; set; }

        public AchievementNotificationDto()
        {
            EventType = "Achievement";
        }
    }

}
