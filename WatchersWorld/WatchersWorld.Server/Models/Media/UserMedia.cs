using System.ComponentModel.DataAnnotations;
using System.ComponentModel.DataAnnotations.Schema;

namespace WatchersWorld.Server.Models.Media
{
    /// <summary>
    /// Representa a relação entre um utilizador e os Media associados, permitindo associar um utilizador
    /// a uma lista específica de Media ou a um Media individual.
    /// </summary>
    public class UserMedia
    {
        /// <summary>
        /// Identificador único para cada associação de utilizador com Media, servindo como chave primária.
        /// </summary>
        [Key]
        public int Id { get; set; }

        /// <summary>
        /// Identificador do utilizador associado. Este campo deve conter o identificador único do utilizador
        /// que está relacionado com os Media especificados.
        /// </summary>
        public string UserId { get; set; }

        /// <summary>
        /// Identificador da tabela de Media associada. Este campo é uma chave estrangeira que referencia
        /// a tabela `MediaInfoModel`, indicando um Media específico associado ao utilizador.
        /// </summary>
        public int IdTableMedia { get; set; }

        /// <summary>
        /// Identificador opcional da lista de Media associada. Este campo é uma chave estrangeira que pode
        /// referenciar a tabela `MediaListModel`, indicando que o utilizador está associado a uma lista
        /// específica de Media. Pode ser nulo se o utilizador estiver associado diretamente a um Media
        /// individual através de `IdTableMedia`.
        /// </summary>
        public int? IdListMedia { get; set; }

        /// <summary>
        /// Propriedade de navegação para a tabela `MediaInfoModel`. Esta propriedade virtual permite o acesso
        /// direto ao Media associado ao utilizador através de `IdTableMedia`, facilitando o acesso aos detalhes
        /// do Media sem necessidade de consultas adicionais.
        /// </summary>
        /// <remarks>
        /// A anotação [ForeignKey("IdTableMedia")] indica que o campo `IdTableMedia` é utilizado como chave
        /// estrangeira para estabelecer a relação com `MediaInfoModel`.
        /// </remarks>
        [ForeignKey("IdTableMedia")] // Isto indica que 'IdTableMedia' é uma FK para a tabela MediaInfoModel
        public virtual MediaInfoModel MediaInfoModel { get; set; } // Navegação para MediaInfoModel

        /// <summary>
        /// Propriedade de navegação para a tabela `MediaListModel`. Esta propriedade virtual permite o acesso
        /// direto à lista de Media associada ao utilizador através de `IdListMedia`, facilitando o acesso aos
        /// detalhes da lista de Media sem necessidade de consultas adicionais.
        /// </summary>
        /// <remarks>
        /// A anotação [ForeignKey("IdListMedia")] indica que o campo `IdListMedia` é utilizado como chave
        /// estrangeira para estabelecer a relação com `MediaListModel`.
        /// </remarks>
        [ForeignKey("IdListMedia")]
        public virtual MediaListModel MediaListModel { get; set; } // Navegação para MediaListModel


        public DateTime? DateMarked{ get; set; }

    }

}
