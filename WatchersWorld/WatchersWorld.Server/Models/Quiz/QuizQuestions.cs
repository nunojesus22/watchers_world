using System.ComponentModel.DataAnnotations;

namespace WatchersWorld.Server.Models.Quiz
{
    public class QuizQuestions
    {
        [Key]
        public int Id { get; set; }

        public string name { get; set; }

        public int type { get; set; }

    }
}
