using System.ComponentModel.DataAnnotations.Schema;
using System.ComponentModel.DataAnnotations;
using Microsoft.EntityFrameworkCore;


namespace WatchersWorld.Server.Models.Media
{
    /// <summary>
    /// Modelo para informação detalhada sobre um item de Media, incluindo identificador e tipo.
    /// </summary>
    public class MediaInfoModel
    {
        /// <summary>
        /// Identificador único da tabela de Media.
        /// </summary>
        [Key] 
        public int IdTableMedia { get; set; }

        /// <summary>
        /// Identificador da Media no sistema.
        /// </summary>
        public int IdMedia { get; set; }

        /// <summary>
        /// Tipo da Media (por exemplo, filme, série).
        /// </summary>
        public string Type { get; set; }

    }
}
