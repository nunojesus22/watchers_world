using System.ComponentModel.DataAnnotations.Schema;
using WatchersWorld.Server.Models.Authentication;

namespace WatchersWorld.Server.Models.Notifications
{
    public class MessageNotification : Notification
    {
        /// <summary>
        /// Identificador da Mensagem que acionou a notificação
        /// </summary>
        [ForeignKey("Messages")]
        public string MessageId { get; set; }

        /// <summary>
        /// Identificador do utilizador destinatário da notificação
        /// </summary>
        [ForeignKey(nameof(User.Id))]
        public string TargetUserId { get; set; }

        public MessageNotification()
        {
            EventType = "Message";
        }
    }
}
