using System;
using System.ComponentModel.DataAnnotations;
using System.ComponentModel.DataAnnotations.Schema;
using WatchersWorld.Server.Models.Media;

namespace WatchersWorld.Server.Models.Notifications
{
    /// <summary>
    /// Representa uma notificação enviada a um utilizador sobre novos conteúdos de media ou episódios disponíveis.
    /// </summary>
    public class MediaNotification : Notification
    {
        /// <summary>
        /// Identificador único da relação UserMedia associada à notificação.
        /// Este campo é uma chave estrangeira que referencia a tabela `UserMedia`,
        /// indicando a relação específica do utilizador com a media para a qual está a ser notificado.
        /// </summary>
        [ForeignKey(nameof(UserMedia.Id))]
        public int UserMediaId { get; set; }

        /// <summary>
        /// Propriedade de navegação para a entidade UserMedia. Esta propriedade virtual permite o acesso
        /// direto à relação UserMedia associada a esta notificação, facilitando o acesso aos detalhes
        /// da media relacionada sem necessidade de consultas adicionais.
        /// </summary>
        public virtual UserMedia UserMedia { get; set; }
    }
}
