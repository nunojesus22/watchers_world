using System.ComponentModel.DataAnnotations;
using System.ComponentModel.DataAnnotations.Schema;

namespace WatchersWorld.Server.Models.Quiz
{
    public class QuizOption
    {
        [Key]
        public int Id { get; set; }

        public string name { get; set; }

        public bool answer { get; set; }

        public bool selected { get; set; }

        public int IdQuizQuestion { get; set; }

        [ForeignKey("IdQuizQuestions")]
        public virtual QuizQuestion QuizQuestion { get; set; }

    }


}
