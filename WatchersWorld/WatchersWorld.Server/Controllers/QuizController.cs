using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;
using System.Security.Claims;
using WatchersWorld.Server.Data;
using WatchersWorld.Server.Models.Media.Quiz.WatchersWorld.Server.Models.Media.Quiz;

namespace WatchersWorld.Server.Controllers
{
    [Authorize]
    [Route("api/[controller]")]
    [ApiController]
    public class QuizController:Controller
    {

        private readonly WatchersWorldServerContext _context;

        public QuizController(WatchersWorldServerContext context)
        {
            _context = context;
        }

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



        public class QuizAttemptDto {
            public int Id { get; set; }
            public int MediaId { get; set; } // ID da mídia sobre a qual o quiz foi feito
            public string UserId { get; set; } // ID do usuário que fez o quiz
            public int Score { get; set; } // Pontuação do usuário no quiz
            public DateTime CompletedAt { get; set; } // Data e hora da conclusão do quiz
        }


    }
}

