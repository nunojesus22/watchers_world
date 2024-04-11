using System.ComponentModel.DataAnnotations;
using System.ComponentModel.DataAnnotations.Schema;
using WatchersWorld.Server.Models.Authentication;

namespace WatchersWorld.Server.Models.Gamification
{
    /// <summary>
    /// Classe que representa a atribuição de uma medalha a um utilizador.
    /// Esta classe faz a ligação entre os utilizadores e as medalhas que eles obtiveram, registando quando cada medalha foi adquirida.
    /// Destina-se a rastrear as conquistas dos utilizadores dentro da plataforma.
    /// </summary>
    public class UserMedal
    {
        /// <summary>
        /// Nome de utilizador associado à medalha.
        /// Serve como chave estrangeira, referenciando a entidade User para identificar o utilizador que obteve a medalha.
        /// </summary>
        public string UserName { get; set; }

        /// <summary>
        /// Identificador único da medalha obtida.
        /// Serve como chave estrangeira, referenciando a entidade Medals para identificar a medalha específica adquirida pelo utilizador.
        /// </summary>
        public int MedalId { get; set; }

        /// <summary>
        /// Data em que a medalha foi adquirida pelo utilizador.
        /// Permite rastrear quando o utilizador alcançou o marco ou completou a tarefa necessária para obter a medalha.
        /// </summary>
        public DateTime AcquiredDate { get; set; }
    }
}
