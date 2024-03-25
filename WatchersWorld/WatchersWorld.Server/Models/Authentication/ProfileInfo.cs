using System.ComponentModel.DataAnnotations;
using System.ComponentModel.DataAnnotations.Schema;

namespace WatchersWorld.Server.Models.Authentication
{
    /// <summary>
    /// Classe de perfil que representa o perfil de um utilizador.
    /// Associa detalhes adicionais como biografia, fotos e estado com um utilizador.
    /// Esta classe destina-se a capturar e transmitir informações específicas do perfil do utilizador.
    /// </summary>
    public class ProfileInfo
    {
        /// <summary>
        /// Identificador único do utilizador associado ao perfil, utilizado como chave estrangeira.
        /// </summary>
        [ForeignKey(nameof(User.Id))]
        public string UserId { get; set; }

        /// <summary>
        /// Nome de utilizador (username) associado ao perfil do utilizador, utilizado como identificador único e para fins de comunicação.
        /// Serve também como chave primária e chave estrangeira referenciando a entidade User.
        /// </summary>
        [Key, ForeignKey("User")]
        public string UserName { get; set; }

        /// <summary>
        /// Data de nascimento do utilizador.
        /// Pode ser utilizada para verificação de idade ou apresentada no perfil do utilizador para fins de personalização.
        /// </summary>
        public DateTime BirthDate { get; set; }

        /// <summary>
        /// Descrição ou biografia breve do utilizador.
        /// Pode ser uma declaração pessoal ou qualquer informação que o utilizador deseje partilhar publicamente.
        /// </summary>
        public string Description { get; set; }

        /// <summary>
        /// Género do utilizador.
        /// </summary>
        public char Gender { get; set; }

        /// <summary>
        /// URL ou caminho para a foto de perfil do utilizador.
        /// Esta imagem é normalmente mostrada no perfil do utilizador ou junto ao conteúdo gerado pelo utilizador.
        /// </summary>
        public string ProfilePhoto { get; set; }

        /// <summary>
        /// URL ou caminho para a foto de capa do utilizador.
        /// Esta é uma imagem maior, exibida no topo do perfil do utilizador.
        /// </summary>
        public string CoverPhoto { get; set; }

        /// <summary>
        /// Estado de visibilidade do perfil, representado por uma enumeração (por exemplo, Público, Privado).
        /// Determina a visibilidade ou acessibilidade do perfil a outros utilizadores na plataforma.
        /// </summary>
        public string ProfileStatus { get; set; }

        /// <summary>
        /// Número de seguidores do utilizador.
        /// </summary>
        public int Followers { get; set; }

        /// <summary>
        /// Número de utilizadores que este utilizador segue.
        /// </summary>
        public int Following { get; set; }

        /// <summary>
        /// Data de início de um eventual banimento do utilizador, se aplicável.
        /// </summary>
        public DateTime? StartBanDate { get; set; }

        /// <summary>
        /// Data de término de um eventual banimento do utilizador, se aplicável.
        /// </summary>
        public DateTime? EndBanDate { get; set;}

        public bool IsBanned { get; set; }
    }
}