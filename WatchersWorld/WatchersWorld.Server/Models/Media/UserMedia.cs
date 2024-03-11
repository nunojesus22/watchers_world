using System.ComponentModel.DataAnnotations;
using System.ComponentModel.DataAnnotations.Schema;

namespace WatchersWorld.Server.Models.Media
{
    public class UserMedia
    {
        [Key]
        public int Id { get; set; }

        public string UserId { get; set; }

        public int IdTableMedia { get; set; }

        public int? IdListMedia { get; set; }

        [ForeignKey("IdTableMedia")] // Isto indica que 'IdTableMedia' é uma FK para a tabela MediaInfoModel
        public virtual MediaInfoModel MediaInfoModel { get; set; } // Navegação para MediaInfoModel

        [ForeignKey("IdListMedia")]
        public virtual MediaListModel MediaListModel { get; set; } // Navegação para MediaListModel
    }

}
