namespace WatchersWorld.Server.DTOs.Notifications
{
    /// <summary>
    /// Representa a base para a transferência de dados de notificação.
    /// </summary>
    public class NotificationDto
    {
        /// <summary>
        /// Nome de usuário que desencadeou a notificação.
        /// </summary>
        public string TriggeredByUserId { get; set; }

        /// <summary>
        /// Mensagem da notificação.
        /// </summary>
        public string Message { get; set; }

        /// <summary>
        /// Data e hora da criação da notificação.
        /// </summary>
        public DateTime CreatedAt { get; set; }

        /// <summary>
        /// Indica se a notificação foi lida.
        /// </summary>
        public bool IsRead { get; set; }

        /// <summary>
        /// Tipo de evento que desencadeou a notificação.
        /// </summary>
        public string EventType { get; set; }
    }

}
