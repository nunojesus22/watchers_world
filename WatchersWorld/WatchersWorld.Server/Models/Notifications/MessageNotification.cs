using System.ComponentModel.DataAnnotations.Schema;
using WatchersWorld.Server.Models.Authentication;

namespace WatchersWorld.Server.Models.Notifications
{
    public class MessageNotification : Notification
    {
        /// <summary>
        /// Identificador da mensagem que acionou a notificação.
        /// </summary>
        [ForeignKey("Messages")]
        public string MessageId { get; set; }

        /// <summary>
        /// Identificador do utilizador destinatário da notificação de mensagem.
        /// </summary>
        [ForeignKey(nameof(User.Id))]
        public string TargetUserId { get; set; }

        /// <summary>
        /// Construtor que inicializa uma nova instância da classe MessageNotification com o tipo de evento específico.
        /// </summary>
        public MessageNotification()
        {
            EventType = "Message";
        }
    }
}
