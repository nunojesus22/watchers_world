namespace WatchersWorld.Server.DTOs
{
    /// <summary>
    /// DTO utilizado para transmitir informações sobre notificações.
    /// </summary>
    public class NotificationDto
    {
        /// <summary>
        /// Nome de utilizador do usuário que desencadeou a notificação.
        /// </summary>
        public string TriggeredByUserName { get; set; }

        /// <summary>
        /// Caminho ou URL para a fotografia de perfil do usuário que desencadeou a notificação.
        /// </summary>
        public string TriggeredByUserPhoto { get; set; }

        /// <summary>
        /// O conteúdo da mensagem da notificação.
        /// </summary>
        public string Message { get; set; }

        /// <summary>
        /// A data e hora em que o evento ocorreu e a notificação foi criada.
        /// </summary>
        public DateTime CreatedAt { get; set; }

        /// <summary>
        /// Indica se a notificação já foi lida pelo utilizador.
        /// </summary>
        public bool IsRead { get; set; }

        /// <summary>
        /// O tipo de evento que a notificação representa.
        /// </summary>
        public string EventType { get; set; }
    }
}
