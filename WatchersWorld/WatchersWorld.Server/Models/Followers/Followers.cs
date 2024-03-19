using Microsoft.EntityFrameworkCore;
using System.ComponentModel.DataAnnotations;
using System.ComponentModel.DataAnnotations.Schema;
using WatchersWorld.Server.Models.Authentication;

namespace WatchersWorld.Server.Models.Followers
{
    /// <summary>
    /// Representa a relação de seguimento entre utilizadores na plataforma, incluindo informações sobre quem segue e quem é seguido, 
    /// bem como o estado de aprovação do pedido para seguir.
    /// </summary>
    public class Followers
    {
        /// <summary>
        /// Identificador único da relação de seguimento.
        /// </summary>
        [Key]
        public Guid FollowersId { get; set; }

        /// <summary>
        /// Identificador do utilizador que está a seguir outro utilizador. Chave estrangeira que referencia o identificador único do utilizador na tabela User.
        /// </summary>
        [ForeignKey(nameof(User.Id))]
        public string WhosFollowing { get; set; }

        /// <summary>
        /// Identificador do utilizador que está a ser seguido. Chave estrangeira que referencia o identificador único do utilizador na tabela User.
        /// </summary>
        [ForeignKey(nameof(User.Id))]
        public string WhosBeingFollowed { get; set; }

        /// <summary>
        /// Indica se o pedido para seguir foi aprovado. Isto é usado para aprovação de pedidos para seguir antes de eles se tornarem ativos.
        /// </summary>
        public bool IsApproved { get; set; }
    }
}
