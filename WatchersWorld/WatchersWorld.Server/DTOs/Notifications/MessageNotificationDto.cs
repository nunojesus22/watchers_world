namespace WatchersWorld.Server.DTOs.Notifications
{
    /// <summary>
    /// Representa os dados transferidos para uma notificação de novo seguidor.
    /// </summary>
    public class MessageNotificationDto : NotificationDto
    {
        /// <summary>
        /// Identificador do utilizador destinatário da notificação.
        /// </summary>
        public string TargetUserId { get; set; }

        /// <summary>
        /// Caminho para a foto do utilizador que desencadeou a notificação.
        /// </summary>
        public string TriggeredByUserPhoto { get; set; }

        /// <summary>
        /// Construtor que inicializa uma nova instância da classe MessageNotificationDto com o tipo de evento específico.
        /// </summary>
        public MessageNotificationDto()
        {
            EventType = "Message";
        }
    }
}
