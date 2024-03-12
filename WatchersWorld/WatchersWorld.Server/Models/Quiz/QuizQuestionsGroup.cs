using System.ComponentModel.DataAnnotations;
using System.ComponentModel.DataAnnotations.Schema;

namespace WatchersWorld.Server.Models.Quiz
{
    public class QuizQuestionsGroup
    {
        [Key]
        public int Id { get; set; }

        public bool Done { get; set; }
       
        public int IdQuizQuestions { get; set; }

        [ForeignKey("IdQuizQuestions")]
        public virtual QuizQuestions QuizQuestions { get; set; }

    }
}
