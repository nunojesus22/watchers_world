using WatchersWorld.Server.Models.Authentication;

namespace WatchersWorld.Server.Models.Gamification
{
    public class UserMedal
    {
        public string UserName { get; set; }
        public ProfileInfo Profile { get; set; }


        public int MedalId { get; set; }
        public Medals Medal { get; set; }

        public DateTime AcquiredDate { get; set; }
    }
}
