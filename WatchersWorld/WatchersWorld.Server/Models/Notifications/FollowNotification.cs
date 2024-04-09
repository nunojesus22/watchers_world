using System.ComponentModel.DataAnnotations.Schema;
using WatchersWorld.Server.Models.Authentication;

namespace WatchersWorld.Server.Models.Notifications
{
    /// <summary>
    /// Representa uma notificação enviada a um utilizador sobre novos seguidores.
    /// </summary>
    public class FollowNotification : Notification
    {
        /// <summary>
        /// Identificador do utilizador alvo da notificação.
        /// </summary>
        [ForeignKey(nameof(User.Id))]
        public string TargetUserId { get; set; }

        /// <summary>
        /// Construtor que inicializa uma nova instância da classe FollowNotification com o tipo de evento específico.
        /// </summary>
        public FollowNotification()
        {
            EventType = "NewFollower";
        }
    }
}
