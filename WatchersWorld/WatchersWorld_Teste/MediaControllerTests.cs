using Microsoft.AspNetCore.Http;
using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;
using Microsoft.Extensions.Logging;
using Moq;
using System.Linq.Expressions;
using System.Security.Claims;
using WatchersWorld.Server.Controllers;
using WatchersWorld.Server.Data;
using WatchersWorld.Server.DTOs.Media;
using WatchersWorld.Server.Models.Media;
using WatchersWorld.Server.Services;

namespace WatchersWorld_Teste
{
    public class MediaControllerTests
    {
        private readonly MediaController _controller;
        private readonly Mock<WatchersWorldServerContext> _mockContext = new Mock<WatchersWorldServerContext>();
        private readonly Mock<INotificationService> _mockNotificationService = new Mock<INotificationService>();
        private readonly Mock<ILogger<MediaController>> _mockLogger = new Mock<ILogger<MediaController>>();
        private readonly Mock<GamificationService> _mockGamificationService = new Mock<GamificationService>();

        public MediaControllerTests()
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

            _controller = new MediaController(dbContext, _mockNotificationService.Object, _mockLogger.Object, null);
            _controller.ControllerContext = new ControllerContext
            {
                HttpContext = new DefaultHttpContext { User = user }
            };
        }

        [Fact]
        public async Task MarkAsFavorite_ShouldReturnOk_WhenMediaIsMarked()
        {
            // Arrange
            var request = new UserMediaDto { MediaId = 1, Type = "movie" };


            // Act
            var result =  _controller.MarkAsFavorite(request);

            // Assert
            Assert.IsType<OkObjectResult>(result);
        }

        [Fact]
        public void AddComment_ShouldReturnOk_WhenCommentIsAdded()
        {
            // Arrange
            var request = new CreateCommentDto { MediaId = 1, Text = "Great movie!" };

            // Configura o contexto do usuário para simular um usuário autenticado
            _controller.ControllerContext = new ControllerContext
            {
                HttpContext = new DefaultHttpContext
                {
                    User = new ClaimsPrincipal(new ClaimsIdentity(new Claim[]
                    {
                new Claim(ClaimTypes.NameIdentifier, "userId"),
                    }, "TestAuthentication"))
                }
            };

            // Act
            var result = _controller.AddComment(request);

            // Assert
            Assert.IsType<OkObjectResult>(result);
        }


        [Fact]
        public void IsMediaFavorite_ShouldReturnOk_WithFavoriteStatus()
        {
            // Arrange
            var mediaId = 1;
            var mediaType = "movie";

            // Act
            var result = _controller.IsMediaFavorite(mediaId, mediaType);

            // Assert
            Assert.IsType<OkObjectResult>(result);
        }

        [Fact]
        public void UnmarkAsFavorite_ShouldReturnOk_WhenMediaIsUnmarkedAsFavorite()
        {
            // Arrange
            var request = new UserMediaDto { MediaId = 1, Type = "movie" };

            // Act
             _controller.MarkAsFavorite(request);

            var result = _controller.UnmarkAsFavorite(request);

            // Assert
            Assert.IsType<OkObjectResult>(result);
        }

        [Fact]
        public void UnmarkAsFavoriteSerie_ShouldReturnOk_WhenMediaIsUnmarkedAsFavorite()
        {
            // Arrange
            var request = new UserMediaDto { MediaId = 1, Type = "serie" };

            // Act
            _controller.MarkAsFavorite(request);

            var result = _controller.UnmarkAsFavorite(request);

            // Assert
            Assert.IsType<OkObjectResult>(result);
        }

        [Fact]
        public void MarkAsFavorite_ShouldReturnOk_WhenMediaIsMarkedAsFavorite()
        {
            // Arrange
            var request = new UserMediaDto { MediaId = 1, Type = "movie" };

            // Act
            var result = _controller.MarkAsFavorite(request);

            // Assert
            Assert.IsType<OkObjectResult>(result);
        }

        [Fact]
        public void MarkAsFavoriteSerie_ShouldReturnOk_WhenMediaIsMarkedAsFavorite()
        {
            // Arrange
            var request = new UserMediaDto { MediaId = 1, Type = "serie" };

            // Act
            var result = _controller.MarkAsFavorite(request);

            // Assert
            Assert.IsType<OkObjectResult>(result);
        }



        [Fact]
        public async Task MarkToWatchLater_ShouldMarkMediaAndReturnOk()
        {
            // Arrange
            var request = new UserMediaDto { MediaId = 1, Type = "movie" };

            // Act
            var result = await _controller.MarkToWatchLater(request);

            // Assert
            if (result == Assert.IsType<OkObjectResult>(result)) {
                var responseContent = true;
                Assert.True(Convert.ToBoolean(responseContent));
            }

        }

        [Fact]
        public async Task MarkToWatchLaterSerie_ShouldMarkMediaAndReturnOk()
        {
            // Arrange
            var request = new UserMediaDto { MediaId = 1, Type = "serie" };

            // Act
            var result = await _controller.MarkToWatchLater(request);

            // Assert
            if (result == Assert.IsType<OkObjectResult>(result))
            {
                var responseContent = true;
                Assert.True(Convert.ToBoolean(responseContent));
            }

        }

        [Fact]
        public void UnmarkAsWatchedLater_ShouldUnmarkMediaAndReturnOk()
        {
            // Arrange
            var request = new UserMediaDto { MediaId = 1, Type = "movie" };
            _controller.MarkToWatchLater(request);
            // Act
            var result = _controller.UnmarkAsWatchedLater(request);

            // Assert
            Assert.IsType<OkObjectResult>(result);
        }

        [Fact]
        public void UnmarkAsWatchedLaterSerie_ShouldUnmarkMediaAndReturnOk()
        {
            // Arrange
            var request = new UserMediaDto { MediaId = 1, Type = "serie" };
            _controller.MarkToWatchLater(request);
            // Act
            var result = _controller.UnmarkAsWatchedLater(request);

            // Assert
            Assert.IsType<OkObjectResult>(result);
        }


        [Fact]
        public void LikeAndRemoveLike_ShouldWorkCorrectly()
        {
            // Supondo que exista um comentário com ID 1 para simplificar
            var commentId = 1;

            // Like
            var likeResult = _controller.LikeComment(commentId);
            Assert.IsType<OkObjectResult>(likeResult);

            // Remove Like
            var removeLikeResult = _controller.RemoveLikeFromComment(commentId);
            Assert.IsType<OkObjectResult>(removeLikeResult);
        }
    }


}