namespace WatchersWorld.Server.DTOs.Notifications
{
    /// <summary>
    /// Representa os dados transferidos para uma notificação de resposta a comentário.
    /// </summary>
    public class ReplyNotificationDto : NotificationDto
    {
        /// <summary>
        /// Identificador único da mídia relacionada ao comentário que desencadeou a notificação.
        /// </summary>
        public int MediaId { get; set; }

        /// <summary>
        /// Tipo de mídia do comentário que gerou a notificação.
        /// </summary>
        public string MediaType { get; set; }

        /// <summary>
        /// Identificador único do comentário que desencadeou a notificação.
        /// </summary>
        public int CommentId { get; set; }

        /// <summary>
        /// Identificador do utilizador destinatário da notificação.
        /// </summary>
        public string TargetUserId { get; set; }

        /// <summary>
        /// Caminho para a foto do utilizador que desencadeou a notificação.
        /// </summary>
        public string TriggeredByUserPhoto { get; set; }

        /// <summary>
        /// Construtor que inicializa uma nova instância da classe ReplyNotificationDto com o tipo de evento específico.
        /// </summary>
        public ReplyNotificationDto()
        {
            EventType = "Reply";
        }
    }

}
