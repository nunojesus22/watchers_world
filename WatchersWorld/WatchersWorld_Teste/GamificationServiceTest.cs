using Microsoft.AspNetCore.Identity;
using System;
using System.Collections.Generic;
using System.Linq;
using System.Text;
using System.Threading.Tasks;
using WatchersWorld.Server.Data;
using WatchersWorld.Server.Services;
using WatchersWorld_Teste.FixtureConfiguration.SeedsConfiguration;
using WatchersWorld_Teste.FixtureConfiguration;
using WatchersWorld.Server.Models.Authentication;
using Microsoft.EntityFrameworkCore;

namespace WatchersWorld_Teste
{
    public class GamificationServiceTest : IClassFixture<IntegrationTestsFixture>
    {
        private readonly IGamificationService _gamificationService ;
        private readonly UserManager<User> _userManager;
        private readonly WatchersWorldServerContext _context;


        public GamificationServiceTest(IntegrationTestsFixture fixture)
        {
            _userManager = fixture.UserManager;
            _gamificationService = fixture.GamificationService;
            _context = fixture.Context;
            fixture.ApplySeedAsync(new GamificationTestSeedConfiguration(fixture.GamificationService)).Wait();
        }

        [Fact]
        public async Task AwardMedalAsync_UserAndMedalExist_ShouldAwardMedal()
        {
            var medal = await _context.Medals.FirstOrDefaultAsync(m => m.Name == "Conta Criada");
            Assert.NotNull(medal); // Ensure the medal exists

            var result = await _gamificationService.AwardMedalAsync("UserTest4", "Conta Criada");
            Assert.True(result);

            var userMedalExists = await _context.UserMedals
                .AnyAsync(um => um.UserName == "UserTest4" && um.MedalId == medal.Id);
            Assert.True(userMedalExists);
        }

        [Fact]
        public async Task AwardMedalAsync_MedalDoesNotExist_ShouldReturnFalse()
        {
            var result = await _gamificationService.AwardMedalAsync("UserTest1", "Nonexistent Medal");
            Assert.False(result);
        }

        [Fact]
        public async Task AwardMedalAsync_UserDoesNotExist_ShouldReturnFalse()
        {
            var result = await _gamificationService.AwardMedalAsync("Nonexistent User", "Conta Criada");
            Assert.False(result);
        }

        [Fact]
        public async Task GetUnlockedMedalsAsync_UserHasUnlockedMedals_ShouldReturnUnlockedMedals()
        {
            await _gamificationService.AwardMedalAsync("UserTest1", "Conta Criada");
            var medals = await _gamificationService.GetUnlockedMedalsAsync("UserTest1");
            Assert.NotEmpty(medals);
            Assert.Contains(medals, m => m.Name == "Conta Criada");
        }

        [Fact]
        public async Task GetUnlockedMedalsAsync_UserHasNoUnlockedMedals_ShouldReturnEmptyList()
        {
            var medals = await _gamificationService.GetUnlockedMedalsAsync("UserTest2");
            Assert.Empty(medals);
        }

        [Fact]
        public async Task GetLockedMedalsAsync_UserHasLockedMedals_ShouldReturnLockedMedals()
        {
            var medal = await _context.Medals.FirstOrDefaultAsync(m => m.Name == "Editar perfil");
            Assert.NotNull(medal);

            // Assuming "UserTest1" has not unlocked all available medals
            await _gamificationService.AwardMedalAsync("UserTest1", "Conta Criada");
            await _gamificationService.AwardMedalAsync("UserTest1", "Primeiro Filme");
            await _gamificationService.AwardMedalAsync("UserTest1", "Primeira Série");
            await _gamificationService.AwardMedalAsync("UserTest1", "Seguir um utilizador");
            var medals = await _gamificationService.GetLockedMedalsAsync("UserTest1");
            Assert.NotEmpty(medals);

            var userMedalDoesNotExist = await _context.UserMedals
                .AnyAsync(um => um.UserName == "UserTest1" && um.MedalId == medal.Id);
            Assert.False(userMedalDoesNotExist);

        }

        [Fact]
        public async Task GetLockedMedalsAsync_UserHasUnlockedAllMedals_ShouldReturnEmptyList()
        {
            await _gamificationService.AwardMedalAsync("UserTest3", "Conta Criada");
            await _gamificationService.AwardMedalAsync("UserTest3", "Primeiro Filme");
            await _gamificationService.AwardMedalAsync("UserTest3", "Primeira Série");
            await _gamificationService.AwardMedalAsync("UserTest3", "Seguir um utilizador");
            await _gamificationService.AwardMedalAsync("UserTest3", "Editar perfil");

            var medals = await _gamificationService.GetLockedMedalsAsync("UserTest3");
            Assert.Empty(medals);
        }

    }
}
