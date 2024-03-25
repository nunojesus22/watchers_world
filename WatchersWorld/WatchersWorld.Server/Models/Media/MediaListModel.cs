using System.ComponentModel.DataAnnotations;

namespace WatchersWorld.Server.Models.Media
{
    public class MediaListModel
    {
        [Key]
        public int Id { get; set; }


        public string ListName{ get; set; }

    }
}
