using Microsoft.AspNetCore.Identity;
using Microsoft.EntityFrameworkCore;
using WatchersWorld.Server.Data;
using WatchersWorld.Server.Models.Authentication;
using WatchersWorld.Server.Services;
using WatchersWorld_Teste.FixtureConfiguration;
using WatchersWorld_Teste.FixtureConfiguration.SeedsConfiguration;

namespace WatchersWorld_Teste
{
    public class NotificationsServiceTest : IClassFixture<IntegrationTestsFixture>
    {
        private readonly INotificationService _notificationService;
        private readonly UserManager<User> _userManager;
        private readonly WatchersWorldServerContext _context;


        public NotificationsServiceTest(IntegrationTestsFixture fixture)
        {
            _userManager = fixture.UserManager;
            _notificationService = fixture.NotificationsService;
            _context = fixture.Context;
            fixture.ApplySeedAsync(new NotificationsTestSeedConfiguration(fixture.NotificationsService)).Wait();
        }

        [Fact]
        public async Task CreateFollowNotification_ReturnsCorrectDto()
        {
            // Arrange
            var user1 = await _userManager.FindByNameAsync("UserTest1");
            var user2 = await _userManager.FindByNameAsync("UserTest2");

            // Act
            var followNotificationDto = await _notificationService.CreateFollowNotificationAsync(user1!.Id, user2!.Id);

            // Assert
            Assert.NotNull(followNotificationDto);
            Assert.Equal(user1.Id, followNotificationDto.TriggeredByUserId);
            Assert.Equal(user2.Id, followNotificationDto.TargetUserId);
            Assert.Contains("começou-te a seguir", followNotificationDto.Message);

        }

        [Fact]
        public async Task CreateFollowNotification_ThrowsException_WhenUserProfileNotFound()
        {
            // Arrange
            var validUser = await _userManager.FindByNameAsync("UserTest1");
            string invalidUserId = "UserTest8";

            // Act & Assert
            var exception = await Record.ExceptionAsync(() =>
                _notificationService.CreateFollowNotificationAsync(validUser!.Id, invalidUserId));

            Assert.IsType<NullReferenceException>(exception);

            exception = await Record.ExceptionAsync(() =>
                _notificationService.CreateFollowNotificationAsync(invalidUserId, validUser!.Id));

            Assert.IsType<NullReferenceException>(exception);
        }


        [Fact]
        public async Task GetFollowNotificationsForUser_ReturnsListOfNotifications()
        {
            // Arrange
            var user2 = await _userManager.FindByNameAsync("UserTest2");

            // Act
            var followNotifications = await _notificationService.GetFollowNotificationsForUserAsync(user2!.Id);

            // Assert
            Assert.NotNull(followNotifications);
            Assert.NotEmpty(followNotifications);
            foreach (var notification in followNotifications)
            {
                Assert.Equal(user2.Id, notification.TargetUserId);
                Assert.Contains("começou-te a seguir", notification.Message);
            }
        }

        [Fact]
        public async Task CreateMessageNotification_ReturnsCorrectDto()
        {
            // Arrange
            var senderUser = await _userManager.FindByNameAsync("UserTest6");
            var receiverUser = await _userManager.FindByNameAsync("UserTest7");

            // Act
            var messageNotificationDto = await _notificationService.CreateMessageNotificationAsync(senderUser!.Id, receiverUser!.Id);

            // Assert
            Assert.NotNull(messageNotificationDto);
            Assert.Equal(senderUser.Id, messageNotificationDto.TriggeredByUserId);
            Assert.Equal(receiverUser.Id, messageNotificationDto.TargetUserId);
            Assert.Contains("enviou-te uma mensagem", messageNotificationDto.Message);
            Assert.False(messageNotificationDto.IsRead);
            Assert.Equal("Message", messageNotificationDto.EventType);
            Assert.NotNull(messageNotificationDto.TriggeredByUserPhoto);
        }

        [Fact]
        public async Task CreateMessageNotification_ThrowsException_WhenUserProfileNotFound()
        {
            // Arrange
            var validUser = await _userManager.FindByNameAsync("UserTest1");
            string invalidUserId = "InvalidUser";

            // Act & Assert
            await Assert.ThrowsAsync<NullReferenceException>(async () =>
                await _notificationService.CreateMessageNotificationAsync(invalidUserId, validUser!.Id));

            await Assert.ThrowsAsync<NullReferenceException>(async () =>
                await _notificationService.CreateMessageNotificationAsync(validUser!.Id, invalidUserId));
        }

        [Fact]
        public async Task GetMessageNotificationsForUser_ReturnsListOfNotifications()
        {
            // Arrange
            var receiverUser = await _userManager.FindByNameAsync("UserTest7");

            // Act
            var messageNotifications = await _notificationService.GetMessageNotificationsForUserAsync(receiverUser!.Id);

            // Assert
            Assert.NotNull(messageNotifications);
            Assert.NotEmpty(messageNotifications);
            foreach (var notification in messageNotifications)
            {
                Assert.Equal(receiverUser.Id, notification.TargetUserId);
                Assert.Contains("enviou-te uma mensagem", notification.Message);
            }
        }


        [Fact]
        public async Task CreateReplyNotification_ReturnsCorrectDto()
        {
            // Arrange
            var triggeringUser = await _userManager.FindByNameAsync("UserTest3");
            var targetUser = await _userManager.FindByNameAsync("UserTest5");
            var media = await _context.MediaInfoModel.FirstOrDefaultAsync(m => m.IdMedia == 787699 && m.Type == "movie");
            var originalComment = await _context.Comments.FirstOrDefaultAsync(c => c.UserId == targetUser!.Id && c.IdTableMedia == media!.IdTableMedia);
            var replyComment = await _context.Comments.FirstOrDefaultAsync(c => c.UserId == triggeringUser!.Id && c.IdTableMedia == media!.IdTableMedia);

            string replyText = "Concordo, o filme é mesmo bom!";

            // Act
            var replyNotificationDto = await _notificationService.CreateReplyNotificationAsync(
                triggeringUser!.Id,
                targetUser!.Id,
                media!.IdMedia,
                replyComment!.Id,
                replyText);

            // Assert
            Assert.NotNull(replyNotificationDto);
            Assert.Equal(triggeringUser.Id, replyNotificationDto.TriggeredByUserId);
            Assert.Equal(targetUser.Id, replyNotificationDto.TargetUserId);
            Assert.Contains(replyText, replyNotificationDto.Message);
            Assert.False(replyNotificationDto.IsRead);
            Assert.Equal("Reply", replyNotificationDto.EventType);
            Assert.Equal(replyComment.Id, replyNotificationDto.CommentId);
        }

        [Fact]
        public async Task CreateReplyNotification_ThrowsException_WhenAnyEntityNotFound()
        {
            // Arrange
            var nonExistingUserId = "UserTest8";
            var nonExistingMediaId = 999999;
            var nonExistingCommentId = 999999;
            string replyText = "Reply Text";

            // Act & Assert 
            var exceptionTriggeringUserNotFound = await Record.ExceptionAsync(() =>
                _notificationService.CreateReplyNotificationAsync(nonExistingUserId, "ValidUserId", 1, 1, replyText));

            Assert.IsType<NullReferenceException>(exceptionTriggeringUserNotFound);

            var exceptionTargetUserNotFound = await Record.ExceptionAsync(() =>
                _notificationService.CreateReplyNotificationAsync("ValidUserId", nonExistingUserId, 1, 1, replyText));

            Assert.IsType<NullReferenceException>(exceptionTargetUserNotFound);

            var exceptionMediaNotFound = await Record.ExceptionAsync(() =>
                _notificationService.CreateReplyNotificationAsync("ValidUserId", "ValidUserId", nonExistingMediaId, 1, replyText));

            Assert.IsType<NullReferenceException>(exceptionMediaNotFound);

            var exceptionCommentNotFound = await Record.ExceptionAsync(() =>
                _notificationService.CreateReplyNotificationAsync("ValidUserId", "ValidUserId", 1, nonExistingCommentId, replyText));

            Assert.IsType<NullReferenceException>(exceptionCommentNotFound);
        }


        [Fact]
        public async Task GetReplyNotificationsForUser_ReturnsListOfNotifications()
        {
            // Arrange
            var targetUser = await _userManager.FindByNameAsync("UserTest5");

            // Act
            var replyNotifications = await _notificationService.GetReplyNotificationsForUserAsync(targetUser!.Id);

            // Assert
            Assert.NotNull(replyNotifications);
            Assert.NotEmpty(replyNotifications);
            foreach (var notification in replyNotifications)
            {
                Assert.Equal(targetUser.Id, notification.TargetUserId);
                Assert.Contains("respondeu ao seu comentário", notification.Message);
            }
        }

        [Fact]
        public async Task CreateAchievementNotification_ReturnsCorrectDto()
        {
            // Arrange
            var user4 = await _userManager.FindByNameAsync("UserTest4");
            var medal = await _context.Medals.FirstOrDefaultAsync(m => m.Id == 1);

            // Act
            var achievementNotificationDto = await _notificationService.CreateAchievementNotificationAsync(user4!.Id, medal.Id);

            // Assert
            Assert.NotNull(achievementNotificationDto);
            Assert.Equal(user4.Id, achievementNotificationDto.TriggeredByUserId);
            Assert.Contains("Desbloqueaste a medalha:", achievementNotificationDto.Message);
            Assert.False(achievementNotificationDto.IsRead);
            Assert.Equal("Achievement", achievementNotificationDto.EventType);
            Assert.Equal(medal.Id, achievementNotificationDto.UserMedalId);
        }

        [Fact]
        public async Task CreateAchievementNotification_ThrowsException_WhenUserOrMedalNotFound()
        {
            // Arrange
            var nonExistingUserId = "UserTest8";
            var nonExistingMedalId = 999999;

            // Act & Assert
            var exceptionUserNotFound = await Record.ExceptionAsync(() =>
                _notificationService.CreateAchievementNotificationAsync(nonExistingUserId, 1));

            Assert.IsType<NullReferenceException>(exceptionUserNotFound);

            var exceptionMedalNotFound = await Record.ExceptionAsync(() =>
                _notificationService.CreateAchievementNotificationAsync("ValidUserId", nonExistingMedalId));

            Assert.IsType<NullReferenceException>(exceptionMedalNotFound);
        }


        [Fact]
        public async Task GetAchievementNotificationsForUser_ReturnsListOfNotifications()
        {
            // Arrange
            var user4 = await _userManager.FindByNameAsync("UserTest4");

            // Act
            var achievementNotifications = await _notificationService.GetAchievementNotificationsForUserAsync(user4!.Id);

            // Assert
            Assert.NotNull(achievementNotifications);
            Assert.NotEmpty(achievementNotifications);
            foreach (var notification in achievementNotifications)
            {
                Assert.Equal(user4.Id, notification.TriggeredByUserId);
                Assert.Contains("Desbloqueaste a medalha:", notification.Message);
            }
        }

        [Fact]
        public async Task MarkAllFollowNotificationsAsRead_ShouldSetIsReadToTrue()
        {
            // Arrange
            var user = await _userManager.FindByNameAsync("UserTest1");

            // Act
            await _notificationService.MarkAllFollowNotificationsAsReadAsync(user!.UserName);

            // Assert
            var notifications = await _context.FollowNotifications
                .Where(n => n.TargetUserId == user.Id)
                .ToListAsync();

            Assert.All(notifications, n => Assert.True(n.IsRead));
        }

        [Fact]
        public async Task MarkAllReplyNotificationsAsRead_ShouldSetIsReadToTrue()
        {
            // Arrange
            var user = await _userManager.FindByNameAsync("UserTest5");

            // Act
            await _notificationService.MarkAllReplyNotificationsAsReadAsync(user!.UserName);

            // Assert
            var notifications = await _context.ReplyNotifications
                .Where(n => n.TargetUserId == user.Id)
                .ToListAsync();

            Assert.All(notifications, n => Assert.True(n.IsRead));
        }

        [Fact]
        public async Task MarkAllAchievementNotificationsAsRead_ShouldSetIsReadToTrue()
        {
            // Arrange
            var user = await _userManager.FindByNameAsync("UserTest4");

            // Act
            await _notificationService.MarkAllAchievementNotificationsAsReadAsync(user!.UserName);

            // Assert
            var notifications = await _context.AchievementNotifications
                .Where(n => n.TriggeredByUserId == user.Id)
                .ToListAsync();

            Assert.All(notifications, n => Assert.True(n.IsRead));
        }

        [Fact]
        public async Task MarkAllMessageNotificationsAsRead_ShouldSetIsReadToTrue()
        {
            // Arrange
            var user = await _userManager.FindByNameAsync("UserTest6");

            // Act
            await _notificationService.MarkAllMessageNotificationsAsReadAsync(user!.UserName);

            // Assert
            var notifications = await _context.MessageNotifications
                .Where(n => n.TargetUserId == user.Id)
                .ToListAsync();

            Assert.All(notifications, n => Assert.True(n.IsRead));
        }

        [Fact]
        public async Task ClearNotificationsForUser_ShouldRemoveAllNotifications()
        {
            // Arrange
            var user = await _userManager.FindByNameAsync("UserTest6");

            // Act
            await _notificationService.ClearNotificationsForUserAsync(user!.UserName);

            // Assert
            var followNotifications = await _context.FollowNotifications
                .Where(n => n.TargetUserId == user.Id)
                .ToListAsync();

            var replyNotifications = await _context.ReplyNotifications
                .Where(n => n.TargetUserId == user.Id)
                .ToListAsync();

            var achievementNotifications = await _context.AchievementNotifications
                .Where(n => n.TriggeredByUserId == user.Id)
                .ToListAsync();

            var messageNotifications = await _context.MessageNotifications
                .Where(n => n.TargetUserId == user.Id)
                .ToListAsync();

            var mediaNotifications = await _context.MediaNotifications
                .Where(n => n.TriggeredByUserId == user.Id)
                .ToListAsync();

            Assert.Empty(followNotifications);
            Assert.Empty(replyNotifications);
            Assert.Empty(achievementNotifications);
            Assert.Empty(messageNotifications);
            Assert.Empty(mediaNotifications);

        }

        [Fact]
        public async Task HasUnreadNotificationsAsync_ReturnsTrue_WhenThereAreUnreadNotifications()
        {
            // Arrange
            var userWithUnread = await _userManager.FindByNameAsync("UserTest2");

            // Act
            var hasUnread = await _notificationService.HasUnreadNotificationsAsync(userWithUnread!.UserName);

            // Assert
            Assert.True(hasUnread);
        }

        [Fact]
        public async Task HasUnreadNotificationsAsync_ReturnsFalse_WhenThereAreNoUnreadNotifications()
        {
            // Arrange
            var userWithoutUnread = await _userManager.FindByNameAsync("UserTest1");

            // Act
            var hasUnread = await _notificationService.HasUnreadNotificationsAsync(userWithoutUnread!.UserName);

            // Assert
            Assert.False(hasUnread);
        }

        [Fact]
        public async Task HasUnreadNotificationsAsync_ThrowsException_WhenUserNotFound()
        {
            // Arrange
            string nonExistentUserName = "NonExistentUser";

            // Act & Assert
            await Assert.ThrowsAsync<NullReferenceException>(async () =>
                await _notificationService.HasUnreadNotificationsAsync(nonExistentUserName));
        }

        [Fact]
        public async Task CreateMediaNotification_ReturnsCorrectDto()
        {
            // Arrange
            var user6 = await _userManager.FindByNameAsync("UserTest6");
            var media = await _context.MediaInfoModel.FirstOrDefaultAsync(m => m.IdMedia == 787699);

            // Act
            var mediaNotificationDto = await _notificationService.CreateMediaNotificationAsync(user6!.Id, media!.IdMedia, "Nome do Filme", "Caminho/Para/Imagem.jpg");

            // Assert
            Assert.NotNull(mediaNotificationDto);
            Assert.Equal(user6.Id, mediaNotificationDto.TriggeredByUserId);
            Assert.Equal("Um novo episódio de Nome do Filme está disponível!", mediaNotificationDto.Message);
            Assert.False(mediaNotificationDto.IsRead);
            Assert.Equal("NewMedia", mediaNotificationDto.EventType);
        }

        [Fact]
        public async Task CreateMediaNotification_ThrowsException_WhenUserOrMediaNotFound()
        {
            // Arrange
            string nonExistingUserId = "UserTest8";
            int nonExistingMediaId = 999999;

            // Act & Assert
            await Assert.ThrowsAsync<NullReferenceException>(async () =>
                await _notificationService.CreateMediaNotificationAsync(nonExistingUserId, nonExistingMediaId, "Nome do Filme", "Caminho/Para/Imagem.jpg"));

            var existingUser = await _userManager.FindByNameAsync("UserTest6");
            await Assert.ThrowsAsync<NullReferenceException>(async () =>
                await _notificationService.CreateMediaNotificationAsync(existingUser!.Id, nonExistingMediaId, "Nome do Filme", "Caminho/Para/Imagem.jpg"));
        }

        [Fact]
        public async Task GetMediaNotificationsForUser_ReturnsListOfNotifications()
        {
            // Arrange
            var user6 = await _userManager.FindByNameAsync("UserTest6");

            // Act
            var mediaNotifications = await _notificationService.GetMediaNotificationsForUserAsync(user6!.Id, "Nome do Filme", "Caminho/Para/Imagem.jpg");

            // Assert
            Assert.NotNull(mediaNotifications);
            foreach (var notification in mediaNotifications)
            {
                Assert.Equal(user6.Id, notification.TriggeredByUserId);
                Assert.Contains("Um novo episódio de Nome do Filme está disponível!", notification.Message);
            }
        }

        [Fact]
        public async Task MarkAllMediaNotificationsAsRead_ShouldSetIsReadToTrue()
        {
            // Arrange
            var user = await _userManager.FindByNameAsync("UserTest6");

            // Act
            await _notificationService.MarkAllMediaNotificationsAsReadAsync(user!.UserName);

            // Assert
            var notifications = await _context.MediaNotifications
                .Where(n => n.TriggeredByUserId == user.Id)
                .ToListAsync();

            Assert.All(notifications, n => Assert.True(n.IsRead));
        }

    }
}