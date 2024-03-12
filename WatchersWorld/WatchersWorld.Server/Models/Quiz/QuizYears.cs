using System.ComponentModel.DataAnnotations;

namespace WatchersWorld.Server.Models.Quiz
{
    public class QuizYears
    {
        [Key]
        public int Id { get; set; }

        public string name { get; set; }


    }
}
