using System.ComponentModel.DataAnnotations;

namespace WatchersWorld.Server.Models.Media.FavoriteActor
{
    /// <summary>
    /// Representa um ator no sistema, identificado por um identificador único e um nome.
    /// </summary>
    public class Actor
    {

        /// <summary>
        /// Identificador único do ator.
        /// </summary>
        [Required]
        [Key]
        public int ActorId { get; set; }

        /// <summary>
        /// Nome do ator.
        /// </summary>
        [Required]
        public string ActorName { get; set; }
    }
}
