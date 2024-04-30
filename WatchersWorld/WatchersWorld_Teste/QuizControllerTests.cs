using Microsoft.AspNetCore.Http;
using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;
using Moq;
using System;
using System.Collections.Generic;
using System.Linq;
using System.Security.Claims;
using System.Text;
using System.Threading.Tasks;
using WatchersWorld.Server.Controllers;
using WatchersWorld.Server.Data;
using WatchersWorld.Server.Models.Media;
using static WatchersWorld.Server.Controllers.QuizController;

namespace WatchersWorld_Teste
{
    
    public class QuizControllerTests
    {
        private readonly QuizController _controller;
        private readonly Mock<WatchersWorldServerContext> _mockContext = new Mock<WatchersWorldServerContext>();

        public QuizControllerTests()
        {
            // Configuração do DbContext em memória
            var options = new DbContextOptionsBuilder<WatchersWorldServerContext>()
                .UseInMemoryDatabase(databaseName: "TestDb")
                .Options;
            var dbContext = new WatchersWorldServerContext(options);

            // Simulação do usuário para contexto de autorização
            var user = new ClaimsPrincipal(new ClaimsIdentity(new Claim[]
            {
                new Claim(ClaimTypes.NameIdentifier, "userId"),
            }, "TestAuthentication"));

            _controller = new QuizController(dbContext);
            _controller.ControllerContext = new ControllerContext
            {
                HttpContext = new DefaultHttpContext { User = user }
            };

            var mediaInfoModel = new MediaInfoModel
            {
                IdMedia = 1,
                Type = "movie"
            };

            dbContext.MediaInfoModel.Add(mediaInfoModel);
            dbContext.SaveChanges();
        }


        [Fact]
        public async Task SubmitAttempt_ReturnsOk()
        {
            var attemptDto = new QuizController.QuizAttemptDto
            {
                MediaId = 1,
                Score = 80,
                Type="movie"
            };

            var result = await _controller.SubmitAttempt(attemptDto);

            Assert.IsType<OkObjectResult>(result);
        }

        [Fact]
        public async Task CheckQuizStatus_ReturnsOk()
        {
            var mediaId = 1;
            var type = "movie";

            var result = await _controller.CheckQuizStatus(mediaId.ToString(),type);

            Assert.IsType<OkObjectResult>(result);
        }

        [Fact]
        public async Task GetTotalQuizAttempts_ReturnsOk()
        {
            var username = "testUser";

            var attemptDto = new QuizController.QuizAttemptDto
            {
                MediaId = 1,
                Score = 80,
                Type = "movie"
            };
            var result = await _controller.SubmitAttempt(attemptDto);

           

            Assert.IsType<OkObjectResult>(result);
        }
    }
    
}