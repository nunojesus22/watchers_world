using System;
using WatchersWorld.Server.Models.Authentication.Status;

namespace WatchersWorld.Server.Models.Authentication
{
    /// <summary>
    /// Profile class representing a user's profile.
    /// Associates additional details such as bio, photos, and status with a user.
    /// This class is intended to capture and convey user-specific profile information.
    /// </summary>
    public class ProfileInfo
    {
        /// <summary>
        /// Email associated with the user's profile.
        /// Used as a unique identifier for the user's profile and for communication purposes.
        /// </summary>
        public string UserEmail { get; set; }

        /// <summary>
        /// The user's date of birth.
        /// This information can be used for age verification or displayed in user profiles for personalization.
        /// </summary>
        public DateTime BirthDate { get; set; }

        /// <summary>
        /// A brief description or bio of the user.
        /// This could be a personal statement, professional summary, or any other information the user wishes to share publicly.
        /// </summary>
        public string Description { get; set; }

        /// <summary>
        /// URL or path to the user's profile photo.
        /// This image is typically shown in the user's profile or alongside user-generated content to represent the user visually.
        /// </summary>
        public string ProfilePhoto { get; set; }

        /// <summary>
        /// URL or path to the user's cover photo.
        /// This is often a larger image displayed prominently at the top of the user's profile page, typically used for personalization and branding.
        /// </summary>
        public string CoverPhoto { get; set; }

        /// <summary>
        /// Enum representing the visibility status of the profile (e.g., Public, Private).
        /// It dictates the visibility or accessibility of the profile to other users on the platform.
        /// </summary>
        public AccountStatus ProfileStatus { get; set; }
    }
}