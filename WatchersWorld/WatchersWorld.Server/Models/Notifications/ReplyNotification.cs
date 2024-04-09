using System.ComponentModel.DataAnnotations.Schema;
using WatchersWorld.Server.Models.Authentication;

namespace WatchersWorld.Server.Models.Notifications
{
    public class ReplyNotification : Notification
    {
        /// <summary>
        /// Identificador da tabela de Media associada à notificação de resposta.
        /// </summary>
        [ForeignKey("MediaInfoModel")]
        public int IdTableMedia { get; set; }

        /// <summary>
        /// Identificador do comentário associado à notificação de resposta.
        /// </summary>
        [ForeignKey("Comment")]
        public int IdComment { get; set; }

        /// <summary>
        /// Identificador do utilizador destinatário da notificação de resposta.
        /// </summary>
        [ForeignKey(nameof(User.Id))]
        public string TargetUserId { get; set; }

        /// <summary>
        /// Construtor que inicializa uma nova instância da classe ReplyNotification com o tipo de evento específico.
        /// </summary>
        public ReplyNotification()
        {
            EventType = "Reply";
        }
    }
}