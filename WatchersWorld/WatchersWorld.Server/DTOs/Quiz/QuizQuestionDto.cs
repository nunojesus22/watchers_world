using System.ComponentModel.DataAnnotations.Schema;
using WatchersWorld.Server.Models.Quiz;

namespace WatchersWorld.Server.DTOs.Quiz
{
    public class QuizQuestionDto
    {

        public int Id { get; set; }
        public int IdQuizQuestions { get; set; }
        public int IdQuizQuestionsGroup { get; set; }

    }
}
