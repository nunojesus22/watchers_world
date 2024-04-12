using System.ComponentModel.DataAnnotations.Schema;
using System.ComponentModel.DataAnnotations;
using WatchersWorld.Server.Models.Authentication;

namespace WatchersWorld.Server.Models.Chat
{
    /// <summary>
    /// Representa a visibilidade de uma mensagem para um utilizador específico, indicando se a mensagem deve ser visível ou não para esse utilizador.
    /// </summary>
    public class MessagesVisibility
    {
        /// <summary>
        /// Identificador único para a configuração de visibilidade de uma mensagem.
        /// </summary>
        [Key]
        public Guid Id { get; set; }

        /// <summary>
        /// Identificador da mensagem à qual esta configuração de visibilidade se refere. Este campo é obrigatório.
        /// </summary>
        [Required]
        public string MessageId { get; set; }

        /// <summary>
        /// Referência virtual à mensagem associada a esta configuração de visibilidade. Estabelece uma relação de chave estrangeira com a tabela de Messages.
        /// </summary>
        [ForeignKey("MessageId")]
        public virtual Messages Message { get; set; }

        /// <summary>
        /// Identificador do utilizador para o qual a visibilidade da mensagem é definida. Este campo é obrigatório.
        /// </summary>
        [Required]
        public string UserId { get; set; }

        /// <summary>
        /// Referência virtual ao utilizador associado a esta configuração de visibilidade. Estabelece uma relação de chave estrangeira com a tabela de User.
        /// </summary>
        [ForeignKey("UserId")]
        public virtual User User { get; set; }

        /// <summary>
        /// Um valor booleano que determina se a mensagem é visível para o utilizador. Verdadeiro indica que a mensagem é visível, falso indica que não é.
        /// </summary>
        public bool Visibility { get; set; }
    }

}
