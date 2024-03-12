using System.ComponentModel.DataAnnotations.Schema;
using WatchersWorld.Server.Models.Quiz;

namespace WatchersWorld.Server.DTOs.Quiz
{
    public class QuizQuestionsGroupDto
    {
        public int Id { get; set; }

        public bool Done { get; set; }

        public int IdQuizQuestions { get; set; }

    }
}
