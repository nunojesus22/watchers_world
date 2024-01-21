
using System;
using WatchersWorld.Server.Models.Authentication.Status;

namespace WatchersWorld.Server.Models.Authentication
{
    public class Profile
    {
        public Guid UserId { get; set; }
        public RegularUser User { get; set; }
        public AccountStatus ProfileStatus { get; set; }
    }
}
