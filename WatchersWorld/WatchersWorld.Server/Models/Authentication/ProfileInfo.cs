using System;
using System.ComponentModel.DataAnnotations;
using System.ComponentModel.DataAnnotations.Schema;
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
        [Key, ForeignKey("User")]
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

        // A brief description or bio of the user.
        // This could be a personal statement or any information the user wishes to share publicly.
        public string? Description { get; set; }

        public char? Gender { get; set; }

        // URL or path to the user's profile photo.
        // This image is typically shown in the user's profile or next to user-generated content.
        public string ProfilePhoto { get; set; }

        // URL or path to the user's cover photo.
        // This is often a larger image displayed at the top of the user's profile.
        public string CoverPhoto { get; set; }

        /// <summary>
        /// Enum representing the visibility status of the profile (e.g., Public, Private).
        /// It dictates the visibility or accessibility of the profile to other users on the platform.
        /// </summary>
        public AccountStatus ProfileStatus { get; set; }
    }
}