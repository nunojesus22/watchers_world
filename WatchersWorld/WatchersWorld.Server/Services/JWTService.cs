using Microsoft.Extensions.Configuration;
using Microsoft.IdentityModel.Tokens;
using System;
using System.Collections.Generic;
using System.IdentityModel.Tokens.Jwt;
using System.Security.Claims;
using System.Text;
using WatchersWorld.Server.Models.Authentication;

namespace WatchersWorld.Server.Services
{
    /// <summary>
    /// Service class for creating JSON Web Tokens (JWT).
    /// This class is responsible for generating JWTs for user authentication.
    /// </summary>
    public class JWTService
    {
        private readonly IConfiguration _config;
        private readonly SymmetricSecurityKey _jwtKey;

        /// <summary>
        /// Initializes a new instance of the JWTService class.
        /// </summary>
        /// <param name="config">Configuration object to access application settings.</param>
        public JWTService(IConfiguration config)
        {
            _config = config;
            // Convert the key string from the configuration into bytes to be used as a symmetric security key.
            // This key is used to encrypt and decrypt the tokens.
            _jwtKey = new SymmetricSecurityKey(Encoding.UTF8.GetBytes(_config["JWT:Key"]));
        }

        /// <summary>
        /// Creates a JWT for a given user.
        /// </summary>
        /// <param name="user">The user for whom the JWT is to be created.</param>
        /// <returns>A string representing the serialized JWT token.</returns>
        public string CreateJWT(User user)
        {
            // Claims are the pieces of data included within the token.
            var userClaims = new List<Claim>
            {
                new Claim(ClaimTypes.NameIdentifier, user.Id),
                new Claim("UserName", user.UserName),
                new Claim(ClaimTypes.Email, user.Email),
            };

            // Credentials used to sign the token, ensuring its integrity and authenticity.
            var credentials = new SigningCredentials(_jwtKey, SecurityAlgorithms.HmacSha256Signature);

            // Token descriptor which defines the structure of the token.
            var tokenDescriptor = new SecurityTokenDescriptor
            {
                Subject = new ClaimsIdentity(userClaims),
                Expires = DateTime.UtcNow.AddDays(int.Parse(_config["JWT:ExpiresInDays"])),
                SigningCredentials = credentials,
                Issuer = _config["JWT:Issuer"]
            };

            // Handler responsible for creating the token.
            var tokenHandler = new JwtSecurityTokenHandler();
            var jwt = tokenHandler.CreateToken(tokenDescriptor);

            // Return the serialized JWT token as a string.
            return tokenHandler.WriteToken(jwt);
        }
    }
}
