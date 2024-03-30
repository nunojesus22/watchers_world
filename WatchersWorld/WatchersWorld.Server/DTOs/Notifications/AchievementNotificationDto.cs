namespace WatchersWorld.Server.DTOs.Notifications
{
    /// <summary>
    /// Representa os dados transferidos para uma notificação de conquista.
    /// </summary>
    public class AchievementNotificationDto : NotificationDto
    {

        public int UserMedalId { get; set; }

        /// <summary>
        /// Nome de usuário que desencadeou a notificação.
        /// </summary>
        public string AchievementPhoto { get; set; }

        public AchievementNotificationDto()
        {
            EventType = "Achievement";
        }
    }

}
