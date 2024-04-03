using WatchersWorld.Server.Models.Authentication;
using WatchersWorld.Server.Models.Gamification;

namespace WatchersWorld.Server.DTOs.Gamification
{
    public class UserMedalDto
    {
        public string UserName { get; set; }

        public int MedalId { get; set; }

        public DateTime AcquiredDate { get; set; }
    }
}
