using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;
using System.Security.Claims;
using WatchersWorld.Server.Data;
using WatchersWorld.Server.Models.Media.Quiz.WatchersWorld.Server.Models.Media.Quiz;

namespace WatchersWorld.Server.Controllers
{
    /// <summary>
    /// Controlador da API para lidar com operações relacionadas a quizzes.
    /// Requer autenticação para acessar todas as ações.
    /// </summary>
    [Authorize]
    [Route("api/[controller]")]
    [ApiController]
    public class QuizController:Controller
    {

        /// <summary>
        /// Inicializa uma nova instância do controlador QuizController.
        /// </summary>
        /// <param name="context">O contexto do banco de dados.</param>
        private readonly WatchersWorldServerContext _context;

        public QuizController(WatchersWorldServerContext context)
        {
            _context = context;
        }

        /// <summary>
        /// Submete uma tentativa de quiz para uma mídia específica para o utilizador autenticado.
        /// </summary>
        /// <param name="attemptDto">Os detalhes da tentativa de quiz a serem submetidos.</param>
        /// <returns>
        /// Um objeto contendo uma mensagem indicando que a tentativa foi registrada com sucesso.
        /// </returns>
        [HttpPost("/api/quiz/attempt")]
        [Authorize]
        public async Task<ActionResult> SubmitAttempt([FromBody] QuizAttemptDto attemptDto)
        {
            var attempt = new QuizAttempt
            {
                MediaId = attemptDto.MediaId,
                UserId = User.FindFirst(ClaimTypes.NameIdentifier)?.Value,
                Score = attemptDto.Score,
                CompletedAt = DateTime.UtcNow
            };

            _context.QuizAttempts.Add(attempt);
            await _context.SaveChangesAsync();

            return Ok(new { message = "Tentativa registrada com sucesso." });
        }

        /// <summary>
        /// Verifica o status do quiz para uma mídia específica para o utilizador autenticado.
        /// </summary>
        /// <param name="mediaId">O ID da mídia para a qual o status do quiz deve ser verificado.</param>
        /// <returns>
        /// Um objeto contendo informações sobre o status do quiz:
        /// - "hasCompleted": Indica se o utilizador já completou o quiz para a mídia especificada.
        /// - "score" (opcional): A pontuação obtida pelo utilizador na última tentativa de quiz, se houver.
        /// </returns>
        [HttpGet("/api/quiz/check-completed/{mediaId}")]
        public async Task<ActionResult> CheckQuizStatus(int mediaId)
        {
            var userId = User.FindFirst(ClaimTypes.NameIdentifier)?.Value;
            var lastAttempt = await _context.QuizAttempts
                .Where(q => q.MediaId == mediaId && q.UserId == userId)
                .OrderByDescending(q => q.CompletedAt)
                .Select(q => new { q.Score, q.CompletedAt })
                .FirstOrDefaultAsync();

            bool hasCompleted = lastAttempt != null;

            return Ok(new { hasCompleted, lastAttempt?.Score });
        }


        /// <summary>
        /// Obtém o total de tentativas de quiz feitas por um utilizador específico.
        /// </summary>
        /// <param name="username">O nome de utilizador do utilizador para o qual o total de tentativas de quiz deve ser obtido.</param>
        /// <returns>
        /// Um número inteiro representando o total de tentativas de quiz feitas pelo utilizador especificado,
        /// ou uma mensagem de erro se o utilizador não for encontrado.
        /// </returns>
        [HttpGet("/api/quiz/total-attempts/{username}")]
        public async Task<ActionResult<int>> GetTotalQuizAttempts(string username)
        {
            var user = await _context.Users.FirstOrDefaultAsync(u => u.UserName == username);
            if (user == null)
            {
                return NotFound("User not found.");
            }
            var totalAttempts = await _context.QuizAttempts
                .CountAsync(a => a.UserId == user.Id);

            return Ok(totalAttempts);
        }


        public class QuizAttemptDto {
            public int Id { get; set; }
            public int MediaId { get; set; } 
            public string UserId { get; set; } 
            public int Score { get; set; } 
            public DateTime CompletedAt { get; set; } 
        }


    }
}

