using System.ComponentModel.DataAnnotations;
using System.ComponentModel.DataAnnotations.Schema;
using WatchersWorld.Server.Models.Authentication;

namespace WatchersWorld.Server.Models.Chat
{
    /// <summary>
    /// Representa o estado de uma mensagem específica no sistema de mensagens, incluindo detalhes sobre o destinatário e a data/hora em que a mensagem foi lida.
    /// </summary>
    public class MessageStatus
    {
        /// <summary>
        /// Identificador da mensagem cujo estado está sendo rastreado. Este campo é obrigatório e também é a chave primária.
        /// </summary>
        [Key]
        [Required]
        public string MessageId { get; set; }

        /// <summary>
        /// Referência virtual à mensagem associada a este estado. Estabelece uma relação de chave estrangeira com a tabela de Messages.
        /// </summary>
        [ForeignKey("MessageId")]
        public virtual Messages Message { get; set; }

        /// <summary>
        /// Identificador do usuário destinatário da mensagem. Este campo é obrigatório.
        /// </summary>
        [Required]
        public string RecipientUserId { get; set; }

        /// <summary>
        /// Referência virtual ao usuário destinatário da mensagem. Estabelece uma relação de chave estrangeira com a tabela de User.
        /// </summary>
        [ForeignKey("RecipientUserId")]
        public virtual User RecipientUser { get; set; }

        /// <summary>
        /// Data e hora em que a mensagem foi lida pelo destinatário. Este campo é opcional e pode ser nulo se a mensagem ainda não tiver sido lida.
        /// </summary>
        public DateTime? ReadAt { get; set; }
    }

}
