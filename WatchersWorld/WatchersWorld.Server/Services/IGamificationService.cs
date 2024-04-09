using Microsoft.EntityFrameworkCore;
using WatchersWorld.Server.Data;
using WatchersWorld.Server.DTOs.Gamification;
using WatchersWorld.Server.Models.Gamification;

namespace WatchersWorld.Server.Services
{
    /// <summary>
    /// Define as operações de gamificação, como atribuir medalhas e recuperar medalhas bloqueadas e desbloqueadas.
    /// </summary>
    public interface IGamificationService
    {

        /// <summary>
        /// Atribui uma medalha a um utilizador.
        /// </summary>
        /// <param name="userName">O nome do utilizador.</param>
        /// <param name="medalName">O nome da medalha.</param>
        /// <returns>Verdadeiro se a medalha for atribuída com sucesso, falso caso contrário.</returns>
        Task<bool> AwardMedalAsync(string userName, string medalName);

        /// <summary>
        /// Obtém uma lista das medalhas desbloqueadas por um utilizador.
        /// </summary>
        /// <param name="userName">O nome do utilizador.</param>
        /// <returns>Uma lista de DTOs representando as medalhas desbloqueadas.</returns>
        Task<List<MedalsDto>> GetUnlockedMedalsAsync(string userName);

        /// <summary>
        /// Obtém uma lista das medalhas ainda não desbloqueadas por um utilizador.
        /// </summary>
        /// <param name="userName">O nome do utilizador.</param>
        /// <returns>Uma lista de DTOs representando as medalhas bloqueadas.</returns>
        Task<List<MedalsDto>> GetLockedMedalsAsync(string userName);
    }

    /// <summary>
    /// Implementa as operações de gamificação, como atribuir medalhas e recuperar medalhas bloqueadas e desbloqueadas.
    /// </summary>
    public class GamificationService : IGamificationService
    {
        private readonly WatchersWorldServerContext _context;

        /// <summary>
        /// Inicializa uma nova instância da classe de serviço de gamificação com o contexto especificado.
        /// </summary>
        /// <param name="context">O contexto do servidor.</param>
        public GamificationService(WatchersWorldServerContext context)
        {
            _context = context;
        }

        /// <inheritdoc />

        public async Task<bool> AwardMedalAsync(string userName, string medalName)
        {
            var medal = await _context.Medals.FirstOrDefaultAsync(m => m.Name == medalName);
            if (medal == null)
            {
                return false;
            }

            var user = await _context.Users.FirstOrDefaultAsync(u => u.UserName == userName);
            if (user == null)
            {
                return false;
            }

            // Check if the user already has this medal
            bool alreadyAwarded = await _context.UserMedals
                .AnyAsync(um => um.UserName == userName && um.MedalId == medal.Id);
            if (alreadyAwarded)
            {
                return false; // User already has this medal, so we don't award it again
            }

            var userMedal = new UserMedal
            {
                UserName = userName,
                MedalId = medal.Id,
                AcquiredDate = DateTime.UtcNow
            };

            _context.UserMedals.Add(userMedal);
            await _context.SaveChangesAsync();

            return true;
        }


        /// <inheritdoc />

        public async Task<List<MedalsDto>> GetUnlockedMedalsAsync(string userName)
        {
            var unlockedMedals = await _context.UserMedals
                .Where(um => um.UserName == userName)
                .Join(_context.Medals, // The table you want to join with
                      userMedal => userMedal.MedalId, // The foreign key
                      medal => medal.Id, // The primary key in the medals table
                      (userMedal, medal) => new MedalsDto // Result selector
                      {
                          Id = medal.Id,
                          Name = medal.Name,
                          Description = medal.Description,
                          Image = medal.Image
                      })
                .ToListAsync();

            return unlockedMedals;
        }


        /// <inheritdoc />

        public async Task<List<MedalsDto>> GetLockedMedalsAsync(string userName)
        {
            // Get a list of all medal IDs that the user has unlocked.
            var unlockedMedalIds = await _context.UserMedals
                .Where(um => um.UserName == userName)
                .Select(um => um.MedalId)
                .ToListAsync();

            // Get a list of all medals that the user has NOT unlocked.
            var lockedMedals = await _context.Medals
                .Where(m => !unlockedMedalIds.Contains(m.Id)) // Filter out medals the user has unlocked
                .Select(m => new MedalsDto
                {
                    Id = m.Id,
                    Name = m.Name,
                    Description = m.Description,
                    Image = m.Image,
                })
                .ToListAsync();

            return lockedMedals;
        }
    }
}
