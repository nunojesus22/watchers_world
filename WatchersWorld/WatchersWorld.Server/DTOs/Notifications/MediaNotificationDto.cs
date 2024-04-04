namespace WatchersWorld.Server.DTOs.Notifications
{
    /// <summary>
    /// Representa os dados transferidos para uma notificação de nova mídia ou episódio.
    /// </summary>
    public class MediaNotificationDto : NotificationDto
    {
        /// <summary>
        /// Nome da série ou mídia à qual o novo episódio pertence.
        /// </summary>
        public string MediaName { get; set; }

        /// <summary>
        /// Nome da série ou mídia à qual o novo episódio pertence.
        /// </summary>
        public string MediaPhoto { get; set; }

        /// <summary>
        /// Identificador único da relação UserMedia associada à notificação.
        /// Isso pode ser usado para recuperar informações adicionais se necessário.
        /// </summary>
        public int UserMediaId { get; set; }

        /// <summary>
        /// Construtor para inicializar a notificação de nova mídia com o tipo de evento pré-definido.
        /// </summary>
        public MediaNotificationDto()
        {
            EventType = "NewMedia"; // Defina o tipo de evento para nova mídia
        }
    }
}
