namespace WatchersWorld.Server.Models.Authentication.Status
{
    // Enum representing the status of an account.
    // This is used to define whether an account is public or private.
    public enum AccountStatus
    {
        // Indicates that the account is public.
        // Public accounts may have different visibility or accessibility settings compared to private accounts.
        Public,

        // Indicates that the account is private.
        // Private accounts typically have restricted visibility and are accessible only to certain users or groups.
        Private
    }
}
