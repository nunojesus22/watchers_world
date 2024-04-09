namespace WatchersWorld.Server.DTOs.Notifications
{
    /// <summary>
    /// Representa os dados transferidos para uma notificação de novo seguidor.
    /// </summary>
    public class MessageNotificationDto : NotificationDto
    {
        /// <summary>
        /// Nome de utilizador que deve receber a notificação.
        /// </summary>
        public string TargetUserId { get; set; }

        /// <summary>
        /// Foto de utilizador que desencadeou a notificação.
        /// </summary>
        public string TriggeredByUserPhoto { get; set; }

        public MessageNotificationDto()
        {
            EventType = "Message";
        }
    }
}
