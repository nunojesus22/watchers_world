using System.ComponentModel.DataAnnotations;
using System.ComponentModel.DataAnnotations.Schema;
using WatchersWorld.Server.Models.Authentication;

namespace WatchersWorld.Server.Models.Chat
{
    /// <summary>
    /// Representa uma sessão de chat entre dois utilizadores, incluindo os identificadores dos utilizadores e a data de criação do chat.
    /// </summary>
    public class Chat
    {
        /// <summary>
        /// Identificador único do chat.
        /// </summary>
        [Key]
        public Guid Id { get; set; }

        /// <summary>
        /// Identificador do primeiro utilizador no chat. Este campo é obrigatório.
        /// </summary>
        [Required]
        public string User1Id { get; set; }

        /// <summary>
        /// Identificador do segundo utilizador no chat. Este campo é obrigatório.
        /// </summary>
        [Required]
        public string User2Id { get; set; }

        /// <summary>
        /// Referência virtual ao primeiro utilizador envolvido no chat. Associação criada através da chave estrangeira User1Id.
        /// </summary>
        [ForeignKey("User1Id")]
        public virtual User User1 { get; set; }

        /// <summary>
        /// Referência virtual ao segundo utilizador envolvido no chat. Associação criada através da chave estrangeira User2Id.
        /// </summary>
        [ForeignKey("User2Id")]
        public virtual User User2 { get; set; }

        /// <summary>
        /// Data e hora de criação do chat. Este campo é obrigatório.
        /// </summary>
        [Required]
        public DateTime CreatedAt { get; set; }
    }

}
