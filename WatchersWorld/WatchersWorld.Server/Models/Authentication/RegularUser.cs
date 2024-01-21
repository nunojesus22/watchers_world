using System;

namespace WatchersWorld.Server.Models.Authentication
{
    public class RegularUser : User
    {
        public DateTime BirthDate { get; set; }
        public string Description { get; set; }
        public string ProfilePhoto { get; set; }
        public string CoverPhoto { get; set; }


    }
}
