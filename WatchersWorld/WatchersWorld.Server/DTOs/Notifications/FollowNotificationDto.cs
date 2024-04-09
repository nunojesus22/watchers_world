namespace WatchersWorld.Server.DTOs.Notifications
{
    /// <summary>
    /// Representa os dados transferidos para uma notificação de novo seguidor.
    /// </summary>
    public class FollowNotificationDto : NotificationDto
    {
        /// <summary>
        /// Identificador do utilizador alvo que recebe a notificação de um novo seguidor.
        /// </summary>
        public string TargetUserId { get; set; }

        /// <summary>
        /// Caminho para a foto do perfil do utilizador que desencadeou a notificação, ou seja, que começou a seguir o utilizador alvo.
        /// </summary>
        public string TriggeredByUserPhoto { get; set; }

        /// <summary>
        /// Construtor que inicializa uma nova instância da classe FollowNotificationDto com o tipo de evento específico.
        /// </summary>
        public FollowNotificationDto()
        {
            EventType = "NewFollower";
        }
    }
}
