using System.ComponentModel.DataAnnotations;

namespace WatchersWorld.Server.Models.Quiz
{
    public class QuizOption
    {
        [Key]
        public int Id { get; set; }

        public string name { get; set; }

        public bool answer { get; set; }

        public bool selected { get; set; }


    }


}
