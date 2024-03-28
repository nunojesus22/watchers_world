using Microsoft.EntityFrameworkCore;
using WatchersWorld.Server.Data;
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

    }
}
