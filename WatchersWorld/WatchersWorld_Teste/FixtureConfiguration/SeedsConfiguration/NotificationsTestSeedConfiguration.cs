using Mailjet.Client.Resources;
using Microsoft.AspNetCore.Identity;
using WatchersWorld.Server.Chat.Models;
using WatchersWorld.Server.Data;
using WatchersWorld.Server.Models.Authentication;
using WatchersWorld.Server.Models.Gamification;
using WatchersWorld.Server.Models.Media;
using WatchersWorld.Server.Models.Notifications;
using WatchersWorld.Server.Services;
using User = WatchersWorld.Server.Models.Authentication.User;

namespace WatchersWorld_Teste.FixtureConfiguration.SeedsConfiguration
{
    public class NotificationsTestSeedConfiguration : ISeedConfiguration
    {
        private static bool _isSeed;
        private readonly INotificationService _notificationsService;

        public NotificationsTestSeedConfiguration(INotificationService notificationService)
        {
            _notificationsService = notificationService;
        }

        public async Task SeedAsync(UserManager<User> userManager, WatchersWorldServerContext context)
        {
            if (!_isSeed)
            {
                await AddUserWithProfileAsync(userManager, context, "usertest1@gmail.com", "UserTest1", "google", true, "Public");
                await AddUserWithProfileAsync(userManager, context, "usertest2@gmail.com", "UserTest2", "Credentials", true, "Public");
                await AddUserWithProfileAsync(userManager, context, "usertest3@gmail.com", "UserTest3", "Credentials", true, "Public");
                await AddUserWithProfileAsync(userManager, context, "usertest4@gmail.com", "UserTest4", "Credentials", true, "Public");
                await AddUserWithProfileAsync(userManager, context, "usertest5@gmail.com", "UserTest5", "Credentials", true, "Private");
                await AddUserWithProfileAsync(userManager, context, "usertest6@gmail.com", "UserTest6", "Credentials", true, "Private");
                await AddUserWithProfileAsync(userManager, context, "usertest7@gmail.com", "UserTest7", "Credentials", true, "Private");

                var user1ToGetId = await userManager.FindByNameAsync("UserTest1");
                var user2ToGetId = await userManager.FindByNameAsync("UserTest2");
                var user3ToGetId = await userManager.FindByNameAsync("UserTest3");
                var user4ToGetId = await userManager.FindByNameAsync("UserTest4");
                var user5ToGetId = await userManager.FindByNameAsync("UserTest5");
                var user6ToGetId = await userManager.FindByNameAsync("UserTest6");
                var user7ToGetId = await userManager.FindByNameAsync("UserTest7");

                var media = new MediaInfoModel { IdMedia = 787699, Type = "movie" };
                context.MediaInfoModel.Add(media);
                await context.SaveChangesAsync();

                var originalComment = new Comment { UserId = user5ToGetId!.Id, MediaId = media.IdMedia, Text = "Ótimo filme!", CreatedAt = DateTime.UtcNow };
                context.Comments.Add(originalComment);

                var replyComment = new Comment
                {
                    UserId = user3ToGetId!.Id,
                    MediaId = media.IdMedia,
                    Text = "Concordo, o filme é mesmo bom!",
                    CreatedAt = DateTime.UtcNow,
                    ParentCommentId = originalComment.Id
                };
                context.Comments.Add(replyComment);

                var chat = new Chat { Id = Guid.NewGuid(), User1Id = user6ToGetId!.Id, User2Id = user7ToGetId!.Id, CreatedAt = DateTime.UtcNow };
                context.Chats.Add(chat);

                var message = new Messages { Id = Guid.NewGuid().ToString(), ChatId = chat.Id, SendUserId = user6ToGetId.Id, Text = "Olá", SentAt = DateTime.UtcNow };
                context.Messages.Add(message);

                var messageStatus = new MessageStatus { MessageId = message.Id, RecipientUserId = user7ToGetId.Id, ReadAt = DateTime.MaxValue };
                context.MessagesStatus.Add(messageStatus);

                var userMedia = new UserMedia { UserId = user6ToGetId!.Id, IdTableMedia = 1 };
                context.UserMedia.Add(userMedia);

                var firstMovieMedal = new Medals
                {
                    Id = 1,
                    Name = "Primeiro Filme",
                    Description = "Desbloqueada ao avaliar o primeiro filme.",
                    Image = "assets/img/medal.png"
                };

                context.Medals.Add(firstMovieMedal);

                var userMedal = new UserMedal
                {
                    UserName = user4ToGetId!.UserName,
                    MedalId = firstMovieMedal.Id,
                    AcquiredDate = DateTime.UtcNow
                };

                context.UserMedals.Add(userMedal);

                var followNotification = new FollowNotification
                {
                    NotificationId = Guid.NewGuid(),
                    TriggeredByUserId = user1ToGetId!.Id,
                    TargetUserId = user2ToGetId!.Id,
                    CreatedAt = DateTime.UtcNow,
                    Message = $"{user1ToGetId.UserName} começou-te a seguir!"
                };

                var replyNotification = new ReplyNotification
                {
                    NotificationId = Guid.NewGuid(),
                    TriggeredByUserId = user3ToGetId!.Id,
                    TargetUserId = user5ToGetId!.Id,
                    Message = $"{user3ToGetId.UserName} respondeu ao seu comentário.",
                    CreatedAt = DateTime.UtcNow,
                    IsRead = false,
                    EventType = "Reply",
                    IdComment = replyComment.Id,
                    IdTableMedia = 1,
                };

                var achievementNotification = new AchievementNotification
                {
                    NotificationId = Guid.NewGuid(),
                    TriggeredByUserId = user4ToGetId!.Id,
                    Message = $"Desbloqueaste a medalha: Primeiro Filme",
                    CreatedAt = DateTime.UtcNow,
                    IsRead = false,
                    EventType = "Achievement",
                    UserMedalId = firstMovieMedal.Id,
                };

                var messageNotification = new MessageNotification
                {
                    NotificationId = Guid.NewGuid(),
                    TriggeredByUserId = user6ToGetId!.Id,
                    TargetUserId = user7ToGetId!.Id,
                    Message = $"{user6ToGetId.UserName} enviou-te uma mensagem",
                    CreatedAt = DateTime.UtcNow,
                    IsRead = false,
                    EventType = "Message",
                    MessageId = message.Id,
                };

                var mediaNotification = new MediaNotification
                {
                    NotificationId = Guid.NewGuid(),
                    TriggeredByUserId = user6ToGetId!.Id,
                    Message = $"Um novo episódio está disponível!",
                    CreatedAt = DateTime.UtcNow,
                    IsRead = false,
                    EventType = "NewMedia",
                    UserMediaId = userMedia.Id
                };


                context.FollowNotifications.Add(followNotification);
                context.ReplyNotifications.Add(replyNotification);
                context.AchievementNotifications.Add(achievementNotification);
                context.MessageNotifications.Add(messageNotification);
                context.MediaNotifications.Add(mediaNotification);

                await context.SaveChangesAsync();

                _isSeed = true;
            }
        }

        private async Task AddUserWithProfileAsync(UserManager<User> userManager, WatchersWorldServerContext context, string email, string userName, string provider, bool emailConfirmed, string profileStatus = "Public")
        {
            var user = new User
            {
                Email = email,
                UserName = userName,
                Provider = provider,
                EmailConfirmed = emailConfirmed,
            };

            var result = await userManager.CreateAsync(user, user.UserName);
            if (!result.Succeeded)
            {
                throw new Exception("Failed to create user: " + result.Errors.FirstOrDefault()?.Description);
            }

            var userProfile = new ProfileInfo
            {
                UserId = user.Id,
                UserName = user.UserName,
                Description = "Description for " + userName,
                Gender = 'M',
                BirthDate = DateTime.Now.AddYears(-20),
                ProfileStatus = profileStatus,
                ProfilePhoto = "assets/img/pfp2.png",
                CoverPhoto = "assets/img/pfp2.png",
                Following = 0,
                Followers = 0
            };

            context.ProfileInfo.Add(userProfile);
            await context.SaveChangesAsync();
        }


    }
}
