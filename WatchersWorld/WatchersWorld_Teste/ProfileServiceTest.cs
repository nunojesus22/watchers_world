using Microsoft.AspNetCore.Identity;
using Microsoft.EntityFrameworkCore;
using WatchersWorld.Server.Data;
using WatchersWorld.Server.DTOs.ProfileInfoDtos;
using WatchersWorld.Server.Models.Authentication;
using WatchersWorld.Server.Services;
using WatchersWorld_Teste.FixtureConfiguration;
using WatchersWorld_Teste.FixtureConfiguration.SeedsConfiguration;

namespace WatchersWorld_Teste
{
    public class ProfileServiceTest : IClassFixture<IntegrationTestsFixture>
    {
        private readonly IProfileService _profileService;
        private readonly UserManager<User> _userManager;
        private readonly WatchersWorldServerContext _context;


        public ProfileServiceTest(IntegrationTestsFixture fixture)
        {
            _userManager = fixture.UserManager;
            _profileService = fixture.ProfileService;
            _context = fixture.Context;
            fixture.ApplySeedAsync(new ProfileTestSeedConfiguration(fixture.ProfileService)).Wait();
        }

        [Fact]
        public async Task GetUserProfileAsync_ReturnsProfile_WhenUserExists()
        {
            // Arrange
            var user = await _context.ProfileInfo.FirstOrDefaultAsync(p => p.UserName == "UserTest1");

            // Act
            var profileDto = await _profileService.GetUserProfileAsync(user!.UserName);

            // Assert
            Assert.NotNull(profileDto);
            Assert.Equal(user.UserName, profileDto.UserName);
            Assert.Equal(user.Description, profileDto.Description);
            Assert.Equal(user.Gender, profileDto.Gender);
            Assert.Equal(user.BirthDate, profileDto.BirthDate);
            Assert.Equal(user.ProfileStatus, profileDto.ProfileStatus);
            Assert.Equal(user.ProfilePhoto, profileDto.ProfilePhoto);
            Assert.Equal(user.CoverPhoto, profileDto.CoverPhoto);
            Assert.Equal(user.Followers, profileDto.Followers);
            Assert.Equal(user.Following, profileDto.Following);
        }

        [Fact]
        public async Task GetUserProfileAsync_ThrowsException_WhenUserDoesNotExist()
        {
            // Arrange
            string nonExistentUserName = "NonExistentUser";

            // Act & Assert
            await Assert.ThrowsAsync<NullReferenceException>(async () =>
                await _profileService.GetUserProfileAsync(nonExistentUserName));
        }

        [Fact]
        public async Task UpdateUserProfileAsync_ReturnsTrue_WhenProfileIsUpdated()
        {
            // Arrange
            var user = await _context.ProfileInfo.FirstOrDefaultAsync(p => p.UserName == "UserTest1");

            ProfileInfoDto profileUpdateDto = new ProfileInfoDto
            {
                UserName = user!.UserName,
                Description = "Updated Description",
                Gender = 'F',
                BirthDate = DateTime.Now.AddYears(-30),
                ProfileStatus = "Private",
                ProfilePhoto = "assets/img/pfp.png",
                CoverPhoto = "assets/img/pfp.png",
                Following = 0,
                Followers = 0
            };

            // Act
            bool updateResult = await _profileService.UpdateUserProfileAsync(user!.UserId, profileUpdateDto);

            // Assert
            Assert.True(updateResult);
            //var updatedProfile = await _context.ProfileInfo.FindAsync(user.UserId);
            //Assert.NotNull(updatedProfile);
            Assert.Equal(profileUpdateDto.Description, user.Description);
            Assert.Equal(profileUpdateDto.Gender, user.Gender);
            Assert.Equal(profileUpdateDto.BirthDate, user.BirthDate);
            Assert.Equal(profileUpdateDto.ProfileStatus, user.ProfileStatus);
            Assert.Equal(profileUpdateDto.ProfilePhoto, user.ProfilePhoto);
            Assert.Equal(profileUpdateDto.CoverPhoto, user.CoverPhoto);
            Assert.Equal(profileUpdateDto.Followers, user.Followers);
            Assert.Equal(profileUpdateDto.Following, user.Following);
        }

        [Fact]
        public async Task UpdateUserProfileAsync_ReturnsFalse_WhenUserDoesNotExist()
        {
            // Arrange
            string nonExistentUserId = "NonExistentUserId";

            ProfileInfoDto profileUpdateDto = new ProfileInfoDto
            {
                UserName = "NonExistentUser",
                Description = "Updated Description",
                Gender = 'F',
                BirthDate = DateTime.Now.AddYears(-30),
                ProfileStatus = "Private",
                ProfilePhoto = "assets/img/pfp.png",
                CoverPhoto = "assets/img/pfp.png",
                Following = 0,
                Followers = 0
            };

            // Act & Assert
            var exception = await Record.ExceptionAsync(() =>
           _profileService.UpdateUserProfileAsync(nonExistentUserId, profileUpdateDto));

            Assert.IsType<NullReferenceException>(exception);
        }
    }
}