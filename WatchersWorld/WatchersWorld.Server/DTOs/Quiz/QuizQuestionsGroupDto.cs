using System.ComponentModel.DataAnnotations.Schema;
using WatchersWorld.Server.Models.Quiz;

namespace WatchersWorld.Server.DTOs.Quiz
{
    public class QuizQuestionsGroupDto
    {
        public int Id { get; set; }

        public string UserId { get; set; }

        public int MediaId { get; set; }

        public bool Done { get; set; }

    }
}
