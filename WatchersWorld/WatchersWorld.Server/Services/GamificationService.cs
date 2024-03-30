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
                .Select(um => new MedalsDto
                {
                    Id = um.Medal.Id,
                    Name = um.Medal.Name,
                    Description = um.Medal.Description,
                    Image = um.Medal.Image,
                })
                .ToListAsync();

            return unlockedMedals;
        }

    }
}
