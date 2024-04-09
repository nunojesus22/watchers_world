using WatchersWorld.Server.Models.Gamification;

namespace WatchersWorld.Server.DTOs.ProfileInfoDtos
{
    /// <summary>
    /// DTO (Objeto de Transferência de Dados) que representa as informações de perfil de um utilizador.
    /// Inclui detalhes como o nome de utilizador, data de nascimento, descrição, género, fotografias de perfil e de capa, estado do perfil, seguidores, seguindo, e datas de início e fim de banimento.
    /// </summary>
    public class ProfileInfoDto
    {
        /// <summary>
        /// Nome de utilizador associado ao perfil do utilizador. Utilizado como identificador único do perfil do utilizador e para fins de comunicação.
        /// </summary>
        public string UserName { get; set; }

        /// <summary>
        /// Data de nascimento do utilizador. Pode ser utilizada para verificação de idade ou exibida no perfil do utilizador para fins de personalização.
        /// </summary>
        public DateTime BirthDate { get; set; }

        /// <summary>
        /// Descrição ou biografia breve do utilizador. Pode ser uma declaração pessoal ou qualquer informação que o utilizador deseje partilhar publicamente.
        /// </summary>
        public string Description { get; set; }

        /// <summary>
        /// Género do utilizador.
        /// </summary>
        public char Gender { get; set; }

        /// <summary>
        /// URL ou caminho para a fotografia de perfil do utilizador. Esta imagem é tipicamente mostrada no perfil do utilizador ou ao lado de conteúdo gerado pelo utilizador.
        /// </summary>
        public string ProfilePhoto { get; set; }

        /// <summary>
        /// URL ou caminho para a fotografia de capa do utilizador. Esta é frequentemente uma imagem maior exibida no topo do perfil do utilizador.
        /// </summary>
        public string CoverPhoto { get; set; }

        /// <summary>
        /// String representando o estado de visibilidade do perfil (por exemplo, Público, Privado). Dita a visibilidade ou acessibilidade do perfil para outros utilizadores na plataforma.
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
        /// Data de início do banimento do utilizador, se aplicável.
        /// </summary>
        public DateTime StartBanDate { get; set; }

        /// <summary>
        /// Data de fim do banimento do utilizador, se aplicável.
        /// </summary>
        public DateTime EndBanDate { get; set; }


    }
}
