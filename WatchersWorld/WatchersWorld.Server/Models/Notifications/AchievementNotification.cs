using System.ComponentModel.DataAnnotations.Schema;

namespace WatchersWorld.Server.Models.Notifications
{
    /// <summary>
    /// Representa uma notificação enviada a um utilizador sobre novas medalhas conquistadas.
    /// </summary>
    public class AchievementNotification : Notification
    {
        /// <summary>
        /// Identificador da medalha do utilizador associada à notificação.
        /// Este campo é uma chave estrangeira que referencia a tabela `UserMedals`,
        /// indicando a medalha específica do utilizador para a qual a notificação está relacionada.
        /// </summary>
        [ForeignKey("UserMedals")]
        public int UserMedalId { get; set; }

        /// <summary>
        /// Construtor que inicializa uma nova instância da classe AchievementNotification com o tipo de evento específico.
        /// </summary>
        public AchievementNotification()
        {
            EventType = "Achievement";
        }
    }
}
