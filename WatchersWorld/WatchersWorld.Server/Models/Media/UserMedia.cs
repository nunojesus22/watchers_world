using System.ComponentModel.DataAnnotations;
using System.ComponentModel.DataAnnotations.Schema;

namespace WatchersWorld.Server.Models.Media
{
    public class UserMedia
    {
        [Key]
        public int Id { get; set; } // Chave primária autoincrementável

        public string UserId { get; set; }
        public int IdTableMedia { get; set; }

        public int? IdListMedia { get; set; } // FK para MediaListModel

        [ForeignKey("IdListMedia")] // Isto indica que 'IdListMedia' é uma FK para a tabela MediaListModel
        public virtual MediaListModel MediaListModel { get; set; } // Navegação para MediaListModel


        // Propriedades de navegação (se necessário)
        //public virtual ApplicationUser User { get; set; }
        //public virtual MediaInfoModel MediaInfoModel { get; set; }
    }
}
