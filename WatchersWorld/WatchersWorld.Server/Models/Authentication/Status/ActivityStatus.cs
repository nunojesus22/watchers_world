namespace WatchersWorld.Server.Models.Authentication.Status
{
    // Enum representing the activity status of a user.
    // This is used to indicate whether a user is currently online, offline, or in a restricted state.
    public enum ActivityStatus
    {
        // Indicates that the user is currently online.
        // This status is typically used to show that the user is active and available for interaction.
        Online,

        // Indicates that the user is currently offline.
        // This status usually means the user is not active or not available for interaction.
        Offline,

        // Indicates that the user's status is restricted.
        // This could imply limited availability or access, possibly due to privacy settings or specific user conditions.
        Restricted
    }
}
