namespace WatchersWorld.Server.Models.Authentication.Status
{
    /// <summary>
    /// Enum representing the status of an account.
    /// Used to define whether an account is public or private.
    /// </summary>
    public enum AccountStatus
    {
        /// <summary>
        /// Indicates that the account is public.
        /// Public accounts may have different visibility or accessibility settings compared to private accounts.
        /// </summary>
        Public,

        /// <summary>
        /// Indicates that the account is private.
        /// Private accounts typically have restricted visibility and are accessible only to certain users or groups.
        /// </summary>
        Private
    }
}
