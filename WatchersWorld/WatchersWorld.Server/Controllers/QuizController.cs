using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Identity;
using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;
using Microsoft.Win32;
using System.Security.Claims;
using WatchersWorld.Server.Data;
using WatchersWorld.Server.DTOs.Media;
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
        public async Task<IActionResult> RequestQuiz([FromBody] QuizMediaDto movieData, int mediaId)
        {
            var userId = User.FindFirst(ClaimTypes.NameIdentifier)?.Value;
            if (userId == null) return Unauthorized(); // Se utilizador nao estiver logado return erro

            // Ver se quiz da media ja existe
            var existQuiz = _context.QuizQuestionsGroup.FirstOrDefault(model => model.UserId == userId && model.MediaId == mediaId);

            // Se não existir ou nao estiver respondido criar um
            if (existQuiz == null || existQuiz.Done == false)
            {
                await Task.Run(() => CreateNewQuiz(movieData,mediaId, userId));
            }


            var questionGroup = await _context.QuizQuestionsGroup // Selecionar QuizGroup
            .Where(q => q.UserId == userId && q.MediaId == mediaId)
            .ToListAsync();

            var QuestionList = new List<object>();
            var OptionList = new List<object>();

            foreach (var QuizGroup in questionGroup) // Selecionar e Question --5
            {
                var Question = await _context.QuizQuestion
                    .Where(q => q.IdQuizQuestionsGroup == QuizGroup.Id)
                    .ToListAsync();

                QuestionList.Add(new { Question });

                foreach (var QuizQuestion in Question) // Options --5
                {

                    var Option = await _context.QuizOption 
                    .Where(q => q.IdQuizQuestion == QuizQuestion.Id)
                    .ToListAsync();

                    QuestionList.Add(new { Option });

                }
            }

            var Questions = _context.QuizQuestions.ToListAsync(); // Selecionar todos?

            var Result = new { group = questionGroup, question = QuestionList, option = OptionList, questions = Questions };

            return Ok(Result);

        }

        [Authorize]
        [HttpPost("/api/quiz/Verify-quiz/{mediaId}")]
        public async Task<IActionResult> VerifyQuiz([FromBody] QuizMediaDto movieData, int mediaId, [FromBody] List<QuizOptionDto> Option)
        {

            var userId = User.FindFirst(ClaimTypes.NameIdentifier)?.Value;
            if (userId == null) return Unauthorized(); // Se utilizador nao estiver logado return erro

            var questionGroup = await _context.QuizQuestionsGroup // Selecionar QuizGroup
            .Where(q => q.UserId == userId && q.MediaId == mediaId)
            .FirstOrDefaultAsync();

            var Question = await _context.QuizQuestion
            .Where(q => q.IdQuizQuestionsGroup == questionGroup.Id)
            .ToListAsync();


            foreach (var QuizQuestion in Question) // Options --5
            {

                var OptionLocal = await _context.QuizOption
                .Where(q => q.IdQuizQuestion == QuizQuestion.Id)
                .ToListAsync();

                foreach (var option in OptionLocal)
                {
                    var matchingOption = Option.FirstOrDefault(o => o.Id == option.Id);

                    if (matchingOption != null)
                    {
                        option.selected = matchingOption.selected; // copiar selected do client para o servidor
                    }
                }

            }
            
            questionGroup.Done = true;

            await Task.Run(() => RequestQuiz( movieData, mediaId));

            return Ok();

        }

        //Criar novo quiz
        public async Task<IActionResult> CreateNewQuiz([FromBody] QuizMediaDto movieData, int mediaId, string userId)
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
                        await Task.Run(() => GenerateGoodOptions(movieData, NewQuizQuestion.Id, Questions.Id));
                        await Task.Run(() => GenerateBadOptions(movieData,NewQuizQuestion.Id, 1));
                        break;
                    case 1:
                        await Task.Run(() => GenerateGoodOptions(movieData, NewQuizQuestion.Id, Questions.Id));
                        await Task.Run(() => GenerateBadOptions(movieData,NewQuizQuestion.Id, 1));
                        break;
                    case 2:
                        await Task.Run(() => GenerateGoodOptions(movieData, NewQuizQuestion.Id, Questions.Id));
                        await Task.Run(() => GenerateBadOptions(movieData,NewQuizQuestion.Id, 1));
                        break;
                    case 3:
                        await Task.Run(() => GenerateGoodOptions(movieData, NewQuizQuestion.Id, Questions.Id));
                        await Task.Run(() => GenerateBadOptions(movieData, NewQuizQuestion.Id, 2));
                        break;
                    case 4:
                        await Task.Run(() => GenerateGoodOptions(movieData, NewQuizQuestion.Id, Questions.Id));
                        await Task.Run(() => GenerateBadOptions(movieData,NewQuizQuestion.Id, 3));
                        break;
                }


            }

            return Ok();


        }


        // Gerar opções falsas
        public async Task<IActionResult> GenerateBadOptions([FromBody] QuizMediaDto movieData, int IdQuestion, int type)
        {
            List<string> randomNames = null;

            switch (type)
            {
                // Para cada um ir apanhar as tabelas ja feitas para ver se nao têm nomes repetidos

                case 1:

                    randomNames = await _context.QuizNames
                                    .Where(x => !x.name.Contains(movieData.person) && !x.name.Contains(movieData.actor) && !x.name.Contains(movieData.real))
                                    .OrderBy(x => Guid.NewGuid()) // Shuffle as rows
                                    .Select(x => x.name) // Selecionar só 'name'
                                    .Take(5) // Apanhar as primeiras 5
                                    .ToListAsync();
                    break;
                case 2:

                    randomNames = await _context.QuizCategorys
                                    .Where(x => !x.name.Contains(movieData.category))
                                    .OrderBy(x => Guid.NewGuid()) 
                                    .Select(x => x.name) 
                                    .Take(5) 
                                    .ToListAsync();
                    break;
                case 3:
     
                    randomNames = await _context.QuizYears
                                    .Where(x => !x.name.Contains(movieData.year))
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
        public async Task<IActionResult> GenerateGoodOptions([FromBody] QuizMediaDto movieData, int IdQuestion, int IdType)
        {

            string API;

            switch (IdType)
            {
                case 0:

                    // "Este filme pertence a que categoria(s)?", type = 0
                    API = movieData.category;


                    break;
                case 1:

                    // "Atores que fizeram parte do elenco.", type = 1
                    API = movieData.actor;


                    break;
                case 2:

                    // "Em que ano saiu o filme?", type = 2
                    API = movieData.year;


                    break;
                case 3:

                    // "Nome de personagens deste filme.", type = 3
                    API = movieData.person;

                    break;
                case 4:

                    // "Realizador(es) deste filme.", type = 4 
                    API = movieData.real;

                    break;
                }
            
            var NewOption = new QuizOption { name = API.name, answer = true, selected = false, IdQuizQuestion = IdQuestion };
            _context.QuizOption.Add(NewOption);
            _context.SaveChanges();
            

        
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
        public async Task<IActionResult> ResetQuiz([FromBody] QuizMediaDto movieData, int mediaId)
        {

            await Task.Run(() => RemoverQuiz(mediaId));

            await Task.Run(() => RequestQuiz(movieData, mediaId));

            return Ok();

        }

    }



}
