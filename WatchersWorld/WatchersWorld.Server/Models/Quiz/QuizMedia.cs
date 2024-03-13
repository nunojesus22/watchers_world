using System.ComponentModel.DataAnnotations;

namespace WatchersWorld.Server.Models.Quiz
{
    public class QuizMedia
    {
        [Key]
        public int Id { get; set; }

        public string actor { get; set; }

        public string year { get; set; }

        public string person { get; set; }

        public string category { get; set; }

        public string real { get; set; }

    }
}
