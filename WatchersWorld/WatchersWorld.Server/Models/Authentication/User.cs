using Microsoft.AspNetCore.Identity;
using System;
using System.ComponentModel.DataAnnotations;
using System.ComponentModel.DataAnnotations.Schema;
using WatchersWorld.Server.Models.Authentication.Status;

namespace WatchersWorld.Server.Models.Authentication
{
    // Represents a user entity extending the IdentityUser class provided by ASP.NET Core Identity.
    // This class includes all basic user information like username, password, etc., and any additional properties specific to your application.
    public class User : IdentityUser
    {
        [Key, ForeignKey("User")]
        public string UserEmail { get; set; }

        /// <summary>
        /// The user's date of birth.
        /// This information can be used for age verification or displayed in user profiles
        /// </summary>
        public DateTime? BirthDate { get; set; }

        // A brief description or bio of the user.
        // This could be a personal statement or any information the user wishes to share publicly.
        public string Description { get; set; }

        // URL or path to the user's profile photo.
        // This image is typically shown in the user's profile or next to user-generated content.
        public string ProfilePhoto { get; set; }

        // URL or path to the user's cover photo.
        // This is often a larger image displayed at the top of the user's profile.
        public string CoverPhoto { get; set; }

        // Enum representing the status of the profile (e.g., Public, Private).
        // It dictates the visibility or accessibility of the profile to other users.
        public AccountStatus ProfileStatus { get; set; }
    }
}
