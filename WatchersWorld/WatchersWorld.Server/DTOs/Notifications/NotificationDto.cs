namespace WatchersWorld.Server.DTOs.Notifications
{
    /// <summary>
    /// Representa a base para a transferência de dados de notificação.
    /// </summary>
    public class NotificationDto
    {
        /// <summary>
        /// Identificador do utilizador que desencadeou a notificação.
        /// </summary>
        public string TriggeredByUserId { get; set; }

        /// <summary>
        /// Conteúdo da mensagem de notificação.
        /// </summary>
        public string Message { get; set; }

        /// <summary>
        /// Data e hora da criação da notificação.
        /// </summary>
        public DateTime CreatedAt { get; set; }

        /// <summary>
        /// Indica se a notificação já foi lida pelo utilizador destinatário.
        /// </summary>
        public bool IsRead { get; set; }

        /// <summary>
        /// Tipo de evento que desencadeou a notificação, ajudando a identificar o contexto da mesma.
        /// </summary>
        public string EventType { get; set; }
    }

}
