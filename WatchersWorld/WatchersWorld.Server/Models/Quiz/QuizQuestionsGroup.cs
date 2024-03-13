using System.ComponentModel.DataAnnotations;
using System.ComponentModel.DataAnnotations.Schema;

namespace WatchersWorld.Server.Models.Quiz
{
    public class QuizQuestionsGroup
    {
        [Key]
        public int Id { get; set; }
        
        public string UserId { get; set; }

        public int MediaId { get; set; }

        public bool Done { get; set; }

    }
}
