namespace WatchersWorld.Server.DTOs.Notifications
{
    /// <summary>
    /// Representa os dados transferidos para uma notificação de conquista de uma medalha.
    /// </summary>
    public class AchievementNotificationDto : NotificationDto
    {
        /// <summary>
        /// Identificador único da medalha conquistada pelo utilizador.
        /// </summary>
        public int UserMedalId { get; set; }

        /// <summary>
        /// Caminho para a foto representativa da conquista ou medalha.
        /// </summary>
        public string AchievementPhoto { get; set; }

        /// <summary>
        /// Construtor que inicializa uma nova instância da classe AchievementNotificationDto com o tipo de evento específico.
        /// </summary>
        public AchievementNotificationDto()
        {
            EventType = "Achievement";
        }
    }

}
