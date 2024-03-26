namespace WatchersWorld.Server.DTOs.Notifications
{
    /// <summary>
    /// Representa os dados transferidos para uma notificação de resposta a comentário.
    /// </summary>
    public class ReplyNotificationDto : NotificationDto
    {
        /// <summary>
        /// Identificador da mídia associada ao comentário.
        /// </summary>
        public int MediaId { get; set; }

        public string MediaType { get; set; }

        /// <summary>
        /// Identificador do comentário que recebeu a resposta.
        /// </summary>
        public int CommentId { get; set; }

        /// <summary>
        /// Nome de usuário que deve receber a notificação.
        /// </summary>
        public string TargetUserId { get; set; }

        /// <summary>
        /// Nome de usuário que desencadeou a notificação.
        /// </summary>
        public string TriggeredByUserPhoto { get; set; }

        public ReplyNotificationDto()
        {
            EventType = "Reply";
        }
    }

}
