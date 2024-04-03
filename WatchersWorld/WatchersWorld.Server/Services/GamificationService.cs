using Microsoft.EntityFrameworkCore;
using WatchersWorld.Server.Data;
using WatchersWorld.Server.DTOs.Gamification;
using WatchersWorld.Server.Models.Gamification;

namespace WatchersWorld.Server.Services
{
    public class GamificationService
    {
        private readonly WatchersWorldServerContext _context;

        public GamificationService(WatchersWorldServerContext context)
        {
            _context = context;
        }

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
