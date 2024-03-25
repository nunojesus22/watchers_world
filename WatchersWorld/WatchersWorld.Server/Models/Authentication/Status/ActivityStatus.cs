namespace WatchersWorld.Server.Models.Authentication.Status
{
    /// <summary>
    /// Enum representing the activity status of a user.
    /// Used to indicate whether a user is currently online, offline, or in a restricted state.
    /// </summary>
    public enum ActivityStatus
    {
        /// <summary>
        /// Indicates that the user is currently online.
        /// This status is typically used to show that the user is active and available for interaction.
        /// </summary>
        Online,

        /// <summary>
        /// Indicates that the user is currently offline.
        /// This status usually means the user is not active or not available for interaction.
        /// </summary>
        Offline,

        /// <summary>
        /// Indicates that the user's status is restricted.
        /// This could imply limited availability or access, possibly due to privacy settings or specific user conditions.
        /// </summary>
        Restricted
    }
}
