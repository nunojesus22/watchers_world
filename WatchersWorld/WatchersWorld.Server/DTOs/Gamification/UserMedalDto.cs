using System;
using WatchersWorld.Server.Models.Authentication;
using WatchersWorld.Server.Models.Gamification;

namespace WatchersWorld.Server.DTOs.Gamification
{
    /// <summary>
    /// Classe de transferência de dados (DTO) que representa uma medalha atribuída a um utilizador.
    /// Este DTO é utilizado para transferir informações sobre as medalhas obtidas pelos utilizadores entre camadas de aplicação,
    /// facilitando a exposição desses dados em interfaces ou APIs sem expor detalhes internos do modelo de domínio.
    /// </summary>
    public class UserMedalDto
    {
        /// <summary>
        /// Nome de utilizador que obteve a medalha.
        /// Identifica o utilizador que conquistou a medalha, permitindo a associação entre a medalha e o seu detentor.
        /// </summary>
        public string UserName { get; set; }

        /// <summary>
        /// Identificador único da medalha obtida pelo utilizador.
        /// Permite a identificação precisa da medalha conquistada para a apresentação de detalhes relevantes como nome, descrição e imagem.
        /// </summary>
        public int MedalId { get; set; }

        /// <summary>
        /// Data em que a medalha foi adquirida pelo utilizador.
        /// Este campo permite rastrear o momento exato da conquista, podendo ser utilizado para exibição de timelines ou registros históricos de conquistas.
        /// </summary>
        public DateTime AcquiredDate { get; set; }
    }
}
