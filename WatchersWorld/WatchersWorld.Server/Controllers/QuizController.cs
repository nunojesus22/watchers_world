using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Identity;
using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;
using Microsoft.Win32;
using System.Security.Claims;
using WatchersWorld.Server.Data;
using WatchersWorld.Server.DTOs.Quiz;
using WatchersWorld.Server.Models.Quiz;

namespace WatchersWorld.Server.Controllers
{
    [Authorize]
    [Route("api/[controller]")]
    [ApiController]

    public class QuizController : Controller
    {

        private readonly WatchersWorldServerContext _context;

        public QuizController(WatchersWorldServerContext context)
        {
            _context = context;
        }

        [Authorize]
        [HttpPost("/api/quiz/request-quiz/{mediaId}")]
        public async Task<IActionResult> RequestQuiz(int mediaId)
        {
            var userId = User.FindFirst(ClaimTypes.NameIdentifier)?.Value;
            if (userId == null) return Unauthorized(); // Se utilizador nao estiver logado return erro

            // Ver se quiz da media ja existe
            var existQuiz = _context.QuizQuestionsGroup.FirstOrDefault(model => model.UserId == userId && model.MediaId == mediaId);

            // Se não existir ou nao estiver respondido criar um
            if (existQuiz == null || existQuiz.Done == false)
            {
                await Task.Run(() => CreateNewQuiz(mediaId, userId));
            }


            var questionGroup = await _context.QuizQuestionsGroup // Selecionar QuizGroup
            .Where(q => q.UserId == userId && q.MediaId == mediaId)
            .ToListAsync();

            foreach (var QuizGroup in questionGroup) // Selecionar e Question --5
            {
                var Question = await _context.QuizQuestion
                    .Where(q => q.IdQuizQuestionsGroup == QuizGroup.Id)
                    .ToListAsync();


                foreach (var QuizQuestion in Question) // Options --5
                {

                    var Option = await _context.QuizOption 
                    .Where(q => q.IdQuizQuestion == QuizQuestion.Id)
                    .ToListAsync();

                }
            }

            var Questions = _context.QuizQuestions.ToListAsync(); // Selecionar todos?

            return Ok(questionGroup);

        }

        [Authorize]
        [HttpPost("/api/quiz/Verify-quiz/{mediaId}")]
        public async Task<IActionResult> VerifyQuiz(int mediaId, List<QuizOptionDto> Option)
        {

            var userId = User.FindFirst(ClaimTypes.NameIdentifier)?.Value;
            if (userId == null) return Unauthorized(); // Se utilizador nao estiver logado return erro

            // Comparar com o da base de dados

            await Task.Run(() => RequestQuiz(mediaId));

            return Ok();

        }

        //Criar novo quiz
        public async Task<IActionResult> CreateNewQuiz(int mediaId, string userId)
        {

            // Se quiz existir remover
            var existQuiz = _context.QuizQuestionsGroup.FirstOrDefault(model => model.UserId == userId && model.MediaId == mediaId);
            if (existQuiz.Done == false) { await Task.Run(() => RemoverQuiz(mediaId));}


            // Criar novo QuizGroup
            var NewQuizGroup = new QuizQuestionsGroup { UserId = userId, MediaId = mediaId, Done = false };
            _context.QuizQuestionsGroup.Add(NewQuizGroup);
            _context.SaveChanges();

            // Apanhar todas as entradas de Questions
            var allQuestions = _context.QuizQuestions.ToList();

            // Criar tabela com as perguntas
            int counter = 0;
            foreach (var Questions in allQuestions)
            {
                if(counter >= 5){break;} // depois de 5 perguntas sair do loop

                // Criar novo QuizQuestion
                var NewQuizQuestion = new QuizQuestion { IdQuizQuestionsGroup = NewQuizGroup.Id, IdQuizQuestions = Questions.Id };
                _context.QuizQuestion.Add(NewQuizQuestion);
                _context.SaveChanges();

                switch (Questions.type)
                {
                    case 0:
                        await Task.Run(() => GenerateGoodOptions(NewQuizQuestion.Id, Questions.Id));
                        await Task.Run(() => GenerateBadOptions(NewQuizQuestion.Id, 1));
                        break;
                    case 1:
                        await Task.Run(() => GenerateGoodOptions(NewQuizQuestion.Id, Questions.Id));
                        await Task.Run(() => GenerateBadOptions(NewQuizQuestion.Id, 1));
                        break;
                    case 2:
                        await Task.Run(() => GenerateGoodOptions(NewQuizQuestion.Id, Questions.Id));
                        await Task.Run(() => GenerateBadOptions(NewQuizQuestion.Id, 1));
                        break;
                    case 3:
                        await Task.Run(() => GenerateGoodOptions(NewQuizQuestion.Id, Questions.Id));
                        await Task.Run(() => GenerateBadOptions(NewQuizQuestion.Id, 2));
                        break;
                    case 4:
                        await Task.Run(() => GenerateGoodOptions(NewQuizQuestion.Id, Questions.Id));
                        await Task.Run(() => GenerateBadOptions(NewQuizQuestion.Id, 3));
                        break;
                }


            }

            return Ok();


        }


        // Gerar opções falsas
        public async Task<IActionResult> GenerateBadOptions(int IdQuestion, int type)
        {
            List<string> randomNames = null;

            switch (type)
            {
                // Para cada um ir apanhar as tabelas ja feitas para ver se nao têm nomes repetidos

                case 1:

                    randomNames = await _context.QuizNames
                                    .OrderBy(x => Guid.NewGuid()) // Shuffle as rows
                                    .Select(x => x.name) // Selecionar só 'name'
                                    .Take(5) // Apanhar as primeiras 5
                                    .ToListAsync();
                    break;
                case 2:

                    randomNames = await _context.QuizCategorys
                                    .OrderBy(x => Guid.NewGuid()) 
                                    .Select(x => x.name) 
                                    .Take(5) 
                                    .ToListAsync();
                    break;
                case 3:
     
                    randomNames = await _context.QuizYears
                                    .OrderBy(x => Guid.NewGuid()) 
                                    .Select(x => x.name) 
                                    .Take(5) 
                                    .ToListAsync();
                    break;
            }

            if (randomNames != null)
            {

                int counter = 0;
                foreach (var tableInfo in randomNames)
                {
                    if (counter >= 4) { break; } // depois de 4 sair do loop

                    var NewOption = new QuizOption { name = tableInfo, answer = false, selected = false, IdQuizQuestion = IdQuestion };
                    _context.QuizOption.Add(NewOption);
                    _context.SaveChanges();

                }

            }

            return Ok();

        }


        // Gerar opção verdadeira
        public async Task<IActionResult> GenerateGoodOptions(int IdQuestion, int IdType)
        {

            switch (IdType)
            {
                case 0:

                    // "Este filme pertence a que categoria(s)?", type = 0
                    // Usar a API para ir buscar a cena que quero
                        // Apanhar do campo um categoria random

                    break;
                case 1:

                    // "Atores que fizeram parte do elenco.", type = 1
                    // Usar a API para ir buscar a cena que quero
                        // Apanhar do campo um nome random

                    break;
                case 2:

                    // "Em que ano saiu o filme?", type = 2
                    // Usar a API para ir buscar a cena que quero
                        // Apanhar do campo um ano random

                    break;
                case 3:

                    // "Nome de personagens deste filme.", type = 3
                    // Usar a API para ir buscar a cena que quero
                        // Apanhar do campo um nome random

                    break;
                case 4:

                    // "Realizador(es) deste filme.", type = 4 
                    // Usar a API para ir buscar a cena que quero
                        // Apanhar do campo um nome random

                    break;
                }
            /*
            var NewOption = new QuizOption { name = API.name, answer = true, selected = false, IdQuizQuestion = IdQuestion };
            _context.QuizOption.Add(NewOption);
            _context.SaveChanges();
            */
            return Ok();

        }

    // Remover Quiz
    public async Task<IActionResult> RemoverQuiz(int mediaId)
        {

            var userId = User.FindFirst(ClaimTypes.NameIdentifier)?.Value;
            if (userId == null) return Unauthorized(); // Se utilizador nao estiver logado return erro


            var removeQuizGroups = await _context.QuizQuestionsGroup // Selecionar QuizGroup
            .Where(q => q.UserId == userId && q.MediaId == mediaId)
            .ToListAsync();


            foreach (var group in removeQuizGroups) // Selecionar e remover todos os Questions
            {

                var removeQuizQuestions = await _context.QuizQuestion
                    .Where(q => q.IdQuizQuestionsGroup == group.Id)
                    .ToListAsync();


                foreach (var QuizQuestion in removeQuizQuestions) // Options --5
                {
                    var removeOptions = await _context.QuizOption // Selecionar Option
                    .Where(q => q.IdQuizQuestion == QuizQuestion.Id)
                    .ToListAsync();

                    _context.QuizOption.RemoveRange(removeOptions);

                }

                _context.QuizQuestion.RemoveRange(removeQuizQuestions);
            }

            _context.QuizQuestionsGroup.RemoveRange(removeQuizGroups); // Remover QuizGroup

            await _context.SaveChangesAsync();

            return Ok();


        }

        //Reset Quiz
        [Authorize]
        [HttpPost("/api/quiz/reset-quiz/{mediaId}")]
        public async Task<IActionResult> ResetQuiz(int mediaId)
        {

            await Task.Run(() => RemoverQuiz(mediaId));

            await Task.Run(() => RequestQuiz(mediaId));

            return Ok();

        }

    }

}
