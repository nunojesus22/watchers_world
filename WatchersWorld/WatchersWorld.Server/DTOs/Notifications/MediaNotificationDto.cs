namespace WatchersWorld.Server.DTOs.Notifications
{
    /// <summary>
    /// Representa os dados transferidos para uma notificação de nova mídia ou episódio.
    /// </summary>
    public class MediaNotificationDto : NotificationDto
    {
        /// <summary>
        /// Identificador da mídia a que a notificação se refere.
        /// </summary>
        public int MediaId { get; set; }

        /// <summary>
        /// Nome da série ou filme a que o novo episódio ou mídia pertence.
        /// </summary>
        public string MediaName { get; set; }

        /// <summary>
        /// Caminho para a foto representativa da série ou filme.
        /// </summary>
        public string MediaPhoto { get; set; }

        /// <summary>
        /// Identificador da relação UserMedia que conecta o utilizador à mídia específica.
        /// </summary>
        public int UserMediaId { get; set; }

        /// <summary>
        /// Construtor que inicializa uma nova instância da classe MediaNotificationDto com o tipo de evento específico.
        /// </summary>
        public MediaNotificationDto()
        {
            EventType = "NewMedia";
        }
    }
}
