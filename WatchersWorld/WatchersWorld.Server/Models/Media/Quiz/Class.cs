namespace WatchersWorld.Server.Models.Media.Quiz
{
    namespace WatchersWorld.Server.Models.Media.Quiz
    {
        // Entidade Quiz é removida, pois as perguntas e respostas serão gerenciadas no cliente

        public class QuizAttempt
        {
            public int Id { get; set; }
            public int MediaId { get; set; } // ID da mídia sobre a qual o quiz foi feito
            public string UserId { get; set; } // ID do usuário que fez o quiz
            public int Score { get; set; } // Pontuação do usuário no quiz
            public DateTime CompletedAt { get; set; } // Data e hora da conclusão do quiz

            // Removemos a referência para Quiz, pois as perguntas não são mais armazenadas no servidor
            // Removemos a coleção de UserAnswers, pois as respostas específicas não são mais armazenadas no servidor
        }
    }

}
