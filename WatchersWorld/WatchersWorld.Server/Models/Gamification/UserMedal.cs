using WatchersWorld.Server.Models.Authentication;

namespace WatchersWorld.Server.Models.Gamification
{
    public class UserMedal
    {
        public string UserName { get; set; }


        public int MedalId { get; set; }

        public DateTime AcquiredDate { get; set; }
    }
}
