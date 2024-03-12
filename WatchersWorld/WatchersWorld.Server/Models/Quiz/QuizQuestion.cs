using System.ComponentModel.DataAnnotations;
using System.ComponentModel.DataAnnotations.Schema;

namespace WatchersWorld.Server.Models.Quiz
{
    public class QuizQuestion
    {
        [Key]
        public int Id { get; set; }

        public int IdQuizQuestions { get; set; }

        public int IdQuizOption { get; set; }

        [ForeignKey("IdQuizQuestions")]
        public virtual QuizQuestions QuizQuestions { get; set; }

        [ForeignKey("IdQuizOption")]
        public virtual QuizOption QuizOption { get; set; }

    }
}
