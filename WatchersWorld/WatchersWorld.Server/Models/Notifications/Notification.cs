using System;
using System.ComponentModel.DataAnnotations;
using System.ComponentModel.DataAnnotations.Schema;
using WatchersWorld.Server.Models.Authentication;


namespace WatchersWorld.Server.Models.Notifications
{
    /// <summary>
    /// Representa uma notificação que será enviada a um utilizador.
    /// </summary>
    public class Notification
    {
        /// <summary>
        /// Identificador único da notificação.
        /// </summary>
        [Key]
        public Guid NotificationId { get; set; }

        /// <summary>
        /// Identificador do utilizador que causou o evento que desencadeou a notificação.
        /// </summary>
        [ForeignKey(nameof(User.Id))]
        public string TriggeredByUserId { get; set; }

        /// <summary>
        /// O conteúdo da mensagem da notificação.
        /// </summary>
        public string Message { get; set; }

        /// <summary>
        /// A data e hora em que o evento ocorreu e a notificação foi criada.
        /// </summary>
        public DateTime CreatedAt { get; set; }

        /// <summary>
        /// Indica se a notificação já foi lida pelo utilizador.
        /// </summary>
        public bool IsRead { get; set; }

        // Adicionalmente, você pode querer adicionar um tipo ou categoria para a notificação
        /// <summary>
        /// O tipo de evento que a notificação representa (por exemplo, novo seguidor, mensagem, etc.)
        /// </summary>
        public string EventType { get; set; }


    }
}
