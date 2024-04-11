namespace WatchersWorld.Server.Models.Media.Quiz
{
    namespace WatchersWorld.Server.Models.Media.Quiz
    {
       

        public class QuizAttempt
        {

            /// <summary>
            /// O ID da tentativa de quiz.
            /// </summary>
            public int Id { get; set; }
            
            
            /// <summary>
            /// O ID da mídia associada à tentativa de quiz.
            /// </summary>
            public int MediaId { get; set; } 

            /// <summary>
            /// O ID do usuário que fez a tentativa de quiz.
            /// </summary>
            public string UserId { get; set; } 

            /// <summary>
            /// A pontuação obtida na tentativa de quiz.
            /// </summary>
            public int Score { get; set; } 

            /// <summary>
            /// A data e hora em que a tentativa de quiz foi completada.
            /// </summary>
            public DateTime CompletedAt { get; set; } 
           
        }
    }

}
