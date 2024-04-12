using System.ComponentModel.DataAnnotations;
using System.ComponentModel.DataAnnotations.Schema;
using WatchersWorld.Server.Models.Authentication;

namespace WatchersWorld.Server.Models.Chat
{
    /// <summary>
    /// Representa uma mensagem individual dentro de um chat, incluindo detalhes do remetente, texto da mensagem e o momento do envio.
    /// </summary>
    public class Messages
    {
        /// <summary>
        /// Identificador único da mensagem.
        /// </summary>
        [Key]
        public string Id { get; set; }

        /// <summary>
        /// Identificador do chat ao qual a mensagem pertence. Este campo é obrigatório.
        /// </summary>
        [Required]
        public Guid ChatId { get; set; }

        /// <summary>
        /// Referência virtual ao chat associado a esta mensagem. Estabelece uma relação de chave estrangeira com a tabela de Chat.
        /// </summary>
        [ForeignKey("ChatId")]
        public virtual Chat Chat { get; set; }

        /// <summary>
        /// Identificador do usuário que enviou a mensagem. Este campo é obrigatório.
        /// </summary>
        [Required]
        public string SendUserId { get; set; }

        /// <summary>
        /// Referência virtual ao usuário que enviou a mensagem. Estabelece uma relação de chave estrangeira com a tabela de User.
        /// </summary>
        [ForeignKey("SendUserId")]
        public virtual User SendUser { get; set; }

        /// <summary>
        /// Texto da mensagem enviada. Este campo é obrigatório.
        /// </summary>
        [Required]
        public string Text { get; set; }

        /// <summary>
        /// Data e hora em que a mensagem foi enviada. Este campo é obrigatório.
        /// </summary>
        [Required]
        public DateTime SentAt { get; set; }
    }

}
