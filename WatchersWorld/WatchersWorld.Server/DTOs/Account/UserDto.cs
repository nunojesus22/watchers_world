namespace WatchersWorld.Server.DTOs.Account
{
    /// <summary>
    /// DTO for User.
    /// Used to transfer user-related data, such as authentication tokens.
    /// </summary>
    public class UserDto
    {
        /// <summary>
        /// JWT token for authentication and authorization purposes.
        /// </summary>
        public string JWT { get; set; }

        /// <summary>
        /// Username of the user.
        /// </summary>
        public string Username { get; set; }

        /// <summary>
        /// Email address of the user.
        /// </summary>
        public string Email { get; set; }
    }
}
