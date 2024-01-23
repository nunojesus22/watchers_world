namespace WatchersWorld.Server.DTOs.Account
{
    // DTO (Data Transfer Object) for User.
    // This is used to transfer user-related data, such as authentication tokens.
    public class UserDto
    {
        // Property to hold the JSON Web Token (JWT).
        // This token is used for authentication and authorization purposes.
        public string JWT { get; set; }
    }
}
