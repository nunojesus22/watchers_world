namespace WatchersWorld.Server.DTOs.Quiz
{
    public class QuizOptionDto
    {
        public int Id { get; set; }

        public string name { get; set; }

        public bool answer { get; set; }

        public bool selected { get; set; }

        public int IdQuizQuestion { get; set; }

    }
}
