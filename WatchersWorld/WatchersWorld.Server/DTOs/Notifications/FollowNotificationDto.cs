namespace WatchersWorld.Server.DTOs.Notifications
{
    /// <summary>
    /// Representa os dados transferidos para uma notificação de novo seguidor.
    /// </summary>
    public class FollowNotificationDto : NotificationDto
    {
        /// <summary>
        /// Nome de usuário que deve receber a notificação.
        /// </summary>
        public string TargetUserId { get; set; }

        /// <summary>
        /// Nome de usuário que desencadeou a notificação.
        /// </summary>
        public string TriggeredByUserPhoto { get; set; }

        public FollowNotificationDto()
        {
            EventType = "NewFollower";
        }
    }
}
