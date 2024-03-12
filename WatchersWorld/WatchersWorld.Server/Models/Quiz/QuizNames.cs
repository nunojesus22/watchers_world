using System.ComponentModel.DataAnnotations;

namespace WatchersWorld.Server.Models.Quiz
{
    public class QuizNames
    {
        [Key]
        public int Id { get; set; }

        public string name { get; set; }

    }

}
