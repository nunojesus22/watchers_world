using System;
using WatchersWorld.Server.Models.Authentication.Status;

namespace WatchersWorld.Server.Models.Authentication
{
    // Profile class representing a user's profile.
    // This class associates additional profile details with a RegularUser.
    public class Profile
    {
        // Unique identifier for the user. 
        // This is a Guid type to ensure global uniqueness.
        public Guid UserId { get; set; }

        // The RegularUser associated with this profile. 
        // It includes additional personal information about the user.
        public RegularUser User { get; set; }

        // Enum representing the status of the profile (e.g., Public, Private).
        // It dictates the visibility or accessibility of the profile to other users.
        public AccountStatus ProfileStatus { get; set; }
    }
}
