using System;

namespace WatchersWorld.Server.Models.Authentication
{
    // RegularUser class extending the User class. 
    // This class represents a standard user with additional personal information.
    public class RegularUser : User
    {
        /// <summary>
        /// The user's date of birth.
        /// This information can be used for age verification or displayed in user profiles
        /// </summary>
        public DateTime BirthDate { get; set; }

        // A brief description or bio of the user.
        // This could be a personal statement or any information the user wishes to share publicly.
        public string Description { get; set; }

        // URL or path to the user's profile photo.
        // This image is typically shown in the user's profile or next to user-generated content.
        public string ProfilePhoto { get; set; }

        // URL or path to the user's cover photo.
        // This is often a larger image displayed at the top of the user's profile.
        public string CoverPhoto { get; set; }
    }
}
