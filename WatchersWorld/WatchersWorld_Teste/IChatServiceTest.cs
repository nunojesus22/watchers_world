using Microsoft.AspNetCore.Identity;
using Microsoft.EntityFrameworkCore;
using Microsoft.Extensions.DependencyInjection;
using System;
using System.Collections.Generic;
using System.Linq;
using System.Text;
using System.Threading.Tasks;
using WatchersWorld.Server.Data;
using WatchersWorld.Server.DTOs.Chat;
using WatchersWorld.Server.Models.Authentication;
using WatchersWorld.Server.Models.Media.RatingMedia;
using WatchersWorld.Server.Services;
using WatchersWorld_Teste.FixtureConfiguration;
using WatchersWorld_Teste.FixtureConfiguration.SeedsConfiguration;

namespace WatchersWorld_Teste
{
    public class IChatServiceTest : IClassFixture<IntegrationTestsFixture>
    {
        private readonly ChatService _service;
        private readonly UserManager<User> _userManager;
        private readonly WatchersWorldServerContext _context;

        public IChatServiceTest(IntegrationTestsFixture fixture)
        {
            _userManager = fixture.UserManager;
            _service = fixture.ServiceProvider.GetRequiredService<ChatService>();
            _context = fixture.Context;
            fixture.ApplySeedAsync(new ChatTestSeedConfiguration(_service)).Wait();
        }

        [Fact]
        public async Task CreateChat_CreateChatWithSameUser_ShouldReturnFalse()
        {
            var user = await _userManager.FindByNameAsync("UserTest1");

            var result = await _service.CreateChat(user!.Id, user!.Id);

            Assert.False(result);
        }

        [Fact]
        public async Task CreateChat_CreateChatThatExists_ShouldReturnFalse()
        {
            var user1 = await _userManager.FindByNameAsync("UserTest1");
            var user2 = await _userManager.FindByNameAsync("UserTest2");

            var result1 = await _service.CreateChat(user1!.Id, user2!.Id);
            var result2 = await _service.CreateChat(user2!.Id, user1!.Id);

            Assert.False(result1);
            Assert.False(result2);
        }

        [Fact]
        public async Task CreateChat_CreateChatWithUserThatNotExists_ShouldReturnFalse()
        {
            var user1 = await _userManager.FindByNameAsync("UserTest1");
            var user20 = await _userManager.FindByNameAsync("UserTest20");

            var result = await _service.CreateChat(user1!.Id, user20?.Id);

            Assert.False(result);
        }

        [Fact]
        public async Task CreateChat_CreateChatThatNotExist_ShouldReturnTrue()
        {
            var user1 = await _userManager.FindByNameAsync("UserTest1");
            var user3 = await _userManager.FindByNameAsync("UserTest7");

            var result = await _service.CreateChat(user1!.Id, user3!.Id);

            Assert.True(result);
        }

        [Fact]
        public async Task DeleteChat_DeleteChatWithSameUser_ShouldReturnFalse()
        {
            var user = await _userManager.FindByNameAsync("UserTest1");

            var result = await _service.DeleteChat(user!.Id, user!.Id);

            Assert.False(result);
        }

        [Fact]
        public async Task DeleteChat_DeleteChatThatNotExists_ShouldReturnFalse()
        {
            var user6 = await _userManager.FindByNameAsync("UserTest6");
            var user7 = await _userManager.FindByNameAsync("UserTest7");

            var result = await _service.DeleteChat(user6!.Id, user7!.Id);

            Assert.False(result);
        }

        [Fact]
        public async Task DeleteChat_DeleteChatThatExists_ShouldReturnTrue()
        {
            var user1 = await _userManager.FindByNameAsync("UserTest1");
            var user3 = await _userManager.FindByNameAsync("UserTest3");

            await _service.SendMessage(user1!.Id, user3!.Id, "Olá", DateTime.UtcNow);
            await _service.SendMessage(user1!.Id, user3!.Id, "Tudo bem?", DateTime.UtcNow);
            await _service.SendMessage(user3!.Id, user1!.Id, "Está tudo, e por aí?", DateTime.UtcNow);
            await _service.SendMessage(user1!.Id, user3!.Id, "Também!", DateTime.UtcNow);

            var result = await _service.DeleteChat(user1!.Id, user3!.Id);

            Assert.True(result);


            var chat = await _service.GetChatByUsers(user1.Id, user3.Id);
            var messages = await _service.GetAllMessagesByChat(chat.Id.ToString());

            foreach (var message in messages)
            {
                var visibilityUser1 = await _context.MessagesVisibility.FirstOrDefaultAsync(v => v.MessageId == message.MessageId && v.UserId == user1.Id);
                Assert.False(visibilityUser1!.Visibility);

                var visibilityUser3 = await _context.MessagesVisibility.FirstOrDefaultAsync(v => v.MessageId == message.MessageId && v.UserId == user3.Id);
                Assert.True(visibilityUser3!.Visibility);
            }
        }

        [Fact]
        public async Task DeleteMessage_DeleteMessageUserThatNotExists_ShouldReturnFalse()
        {
            var user20 = await _userManager.FindByNameAsync("UserTest20");

            var result = await _service.DeleteMessage(user20?.Id, "");

            Assert.False(result);
        }

        [Fact]
        public async Task DeleteMessage_DeleteMessageMessageThatNotExists_ShouldReturnFalse()
        {
            var user1 = await _userManager.FindByNameAsync("UserTest1");

            var result = await _service.DeleteMessage(user1!.Id, "");

            Assert.False(result);
        }

        [Fact]
        public async Task DeleteMessage_DeleteMessageMessageThatExists_ShouldReturnTrue()
        {
            var user2 = await _userManager.FindByNameAsync("UserTest2");
            var user3 = await _userManager.FindByNameAsync("UserTest3");

            var messageToDelete = await _service.SendMessage(user2!.Id, user3!.Id, "Olá", DateTime.UtcNow);
            await _service.SendMessage(user2!.Id, user3!.Id, "Tudo bem?", DateTime.UtcNow);
            await _service.SendMessage(user3!.Id, user2!.Id, "Está tudo, e por aí?", DateTime.UtcNow);
            await _service.SendMessage(user2!.Id, user3!.Id, "Também!", DateTime.UtcNow);

            var result = await _service.DeleteMessage(user2!.Id, messageToDelete.MessageId);

            Assert.True(result);


            var chat = await _service.GetChatByUsers(user2.Id, user3.Id);
            var messages = await _service.GetAllMessagesByChat(chat.Id.ToString());

            foreach (var message in messages)
            {
                if(message.MessageId == messageToDelete.MessageId)
                {
                    var visibilityUser2 = await _context.MessagesVisibility.FirstOrDefaultAsync(v => v.MessageId == message.MessageId && v.UserId == user2.Id);
                    Assert.False(visibilityUser2!.Visibility);

                    var visibilityUser3 = await _context.MessagesVisibility.FirstOrDefaultAsync(v => v.MessageId == message.MessageId && v.UserId == user3.Id);
                    Assert.True(visibilityUser3!.Visibility);

                } else
                {
                    var visibilityUser2 = await _context.MessagesVisibility.FirstOrDefaultAsync(v => v.MessageId == message.MessageId && v.UserId == user2.Id);
                    Assert.True(visibilityUser2!.Visibility);

                    var visibilityUser3 = await _context.MessagesVisibility.FirstOrDefaultAsync(v => v.MessageId == message.MessageId && v.UserId == user3.Id);
                    Assert.True(visibilityUser3!.Visibility);
                }
            }
        }

        
        [Fact]
        public async Task GetChatsByUser_GetChatsFromUser_ShouldReturnEmpty()
        {
            var user20 = await _userManager.FindByNameAsync("UserTest20");

            var result = await _service.GetChatsByUser(user20?.Id);

            Assert.Empty(result);

        }

        [Fact]
        public async Task GetChatsByUser_GetChatsFromUser_ShouldReturnRigth()
        {
            var user2 = await _userManager.FindByNameAsync("UserTest2");

            var result = await _service.GetChatsByUser(user2!.Id);

            Assert.Equal(3, result.Count);
        }

        [Fact]
        public async Task GetUsersThatHaveChatWith_GetUsersThatHaveChatWithUser_ShouldReturnEmpty()
        {
            var user20 = await _userManager.FindByNameAsync("UserTest20");

            var result = await _service.GetUsersThatHaveChatWith(user20?.Id);

            Assert.Empty(result);

        }

        [Fact]
        public async Task GetUsersThatHaveChatWith_GetUsersThatHaveChatWithUser_ShouldReturnRigth()
        {
            var user2 = await _userManager.FindByNameAsync("UserTest2");
            var user1 = await _userManager.FindByNameAsync("UserTest1");
            var user3 = await _userManager.FindByNameAsync("UserTest3");
            var user4 = await _userManager.FindByNameAsync("UserTest4");

            var result = await _service.GetUsersThatHaveChatWith(user2!.Id);

            Assert.Contains(user1!.Id, result);
            Assert.Contains(user3!.Id, result);
            Assert.Contains(user4!.Id, result);

            Assert.Equal(3, result.Count);
        }

        
        [Fact]
        public async Task SendMessage_SendMessageWhenUserNotExists_ShouldReturnNull()
        {
            var user1 = await _userManager.FindByNameAsync("UserTest1");
            var user20 = await _userManager.FindByNameAsync("UserTest20");

            var result = await _service.SendMessage(user1!.Id, user20?.Id ,"Olá UserTest20");

            Assert.Null(result);
        }

        [Fact]
        public async Task SendMessage_SendMessageWhenUserIsEquals_ShouldReturnNull()
        {
            var user1 = await _userManager.FindByNameAsync("UserTest1");

            var result = await _service.SendMessage(user1!.Id, user1!.Id, "Olá UserTest1");

            Assert.Null(result);
        }

        [Fact]
        public async Task SendMessage_SendMessageWhenMessageTextIsEmpty_ShouldReturnNull()
        {
            var user1 = await _userManager.FindByNameAsync("UserTest1");
            var user2 = await _userManager.FindByNameAsync("UserTest2");

            var result = await _service.SendMessage(user1!.Id, user2!.Id, "");

            Assert.Null(result);
        }

        [Fact]
        public async Task SendMessage_SendMessageWhenEverythingIsCorrect_ShouldReturnMessageDto()
        {
            var user3 = await _userManager.FindByNameAsync("UserTest3");
            var user4 = await _userManager.FindByNameAsync("UserTest4");

            var result = await _service.SendMessage(user3!.Id, user4!.Id, "Olá UserTest4");

            Assert.IsType<MessageDto>(result);

            Assert.Null(result.ReadAt);

            var messageSenderVisibility = await _context.MessagesVisibility
                .FirstOrDefaultAsync(v => v.MessageId == result.MessageId && v.UserId == user3.Id);
            var messageReceiverVisibility = await _context.MessagesVisibility
                .FirstOrDefaultAsync(v => v.MessageId == result.MessageId && v.UserId == user4.Id);

            Assert.NotNull(messageSenderVisibility);
            Assert.NotNull(messageReceiverVisibility);
            Assert.True(messageSenderVisibility.Visibility, "Sender message visibility should be true.");
            Assert.True(messageReceiverVisibility.Visibility, "Receiver message visibility should be true.");
        }

        [Fact]
        public async Task MarkMessageAsRead_MarkMessageAsReadWhenMessageIdIsNull_ShouldReturnNull()
        {
            var result = await _service.MarkMessageAsRead(null);

            Assert.Null(result);
        }

        /*
        [Fact]
        public async Task MarkMessageAsRead_MarkMessageAsReadWhenMessageIdIsCorrect_ShouldReturnTrue()
        {
            var user2 = await _userManager.FindByNameAsync("UserTest2");
            var user3 = await _userManager.FindByNameAsync("UserTest3");

            await _service.SendMessage(user2!.Id, user3!.Id, "Olá UserTest3");

            var chat = await _service.GetChatByUsers(user2!.Id, user3!.Id);
            var message = await _context.Messages.Where(m => m.SendUserId == user2!.Id && m.ChatId == chat!.Id && m.SentAt >= DateTime.UtcNow.AddMinutes(-5)).FirstOrDefaultAsync();

            var result = await _service.MarkMessageAsRead(message!.Id.ToString());

            Assert.True(result);
        }

        [Fact]
        public async Task GetAllMessages_GetAllMessagesByChatWhenChatHaveMessages_ShouldReturnNotEmpty()
        {
            var user2 = await _userManager.FindByNameAsync("UserTest2");
            var user4 = await _userManager.FindByNameAsync("UserTest4");

            var chat = await _service.GetChatByUsers(user2!.Id, user4!.Id);

            await _service.SendMessage(user2!.Id, user4!.Id, "Olá UserTest4");
            await _service.SendMessage(user2!.Id, user4!.Id, "Tudo bem?");

            await _service.SendMessage(user4!.Id, user2!.Id, "Olá UserTest2!");
            await _service.SendMessage(user4!.Id, user2!.Id, "Sim, e contigo?");

            var result = await _service.GetAllMessagesByChat(chat!.Id.ToString());

            Assert.NotEmpty(result);
            Assert.Equal(4, result.Count);
        }

        [Fact]
        public async Task GetAllMessages_GetAllMessagesByChatWhenChatIsNull_ShouldReturnEmpty()
        {
            var user2 = await _userManager.FindByNameAsync("UserTest2");
            var user4 = await _userManager.FindByNameAsync("UserTest4");

            var chat = await _service.GetChatByUsers(user2!.Id, user4!.Id);

            var result = await _service.GetAllMessagesByChat(chat!.Id.ToString());

            Assert.NotEmpty(result);
        }

        [Fact]
        public async Task GetAllMessages_GetAllMessagesByUsersWhenChatHaveMessages_ShouldReturnNotEmpty()
        {
            var user3 = await _userManager.FindByNameAsync("UserTest3");
            var user4 = await _userManager.FindByNameAsync("UserTest4");

            await _service.SendMessage(user3!.Id, user4!.Id, "Olá UserTest4");
            await _service.SendMessage(user3!.Id, user4!.Id, "Tudo bem?");

            await _service.SendMessage(user4!.Id, user3!.Id, "Olá UserTest3!");
            await _service.SendMessage(user4!.Id, user3!.Id, "Sim, e contigo?");

            var result = await _service.GetAllMessagesByUsers(user3!.Id, user4.Id);

            Assert.NotEmpty(result);
            Assert.Equal(4, result.Count);
        }

        [Fact]
        public async Task GetAllMessages_GetAllMessagesByUsersWhenChatIsNull_ShouldReturnEmpty()
        {
            var user4 = await _userManager.FindByNameAsync("UserTest4");
            var user5 = await _userManager.FindByNameAsync("UserTest5");

            var chat = await _service.GetChatByUsers(user4!.Id, user5!.Id);

            var result = await _service.GetAllMessagesByChat(chat?.Id.ToString());

            Assert.Empty(result);
        }
        */
    }
}
