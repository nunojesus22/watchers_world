using Microsoft.IdentityModel.Tokens;
using System.IdentityModel.Tokens.Jwt;
using System.Security.Claims;
using System.Text;
using WatchersWorld.Server.Models.Authentication;

namespace WatchersWorld.Server.Services
{
    /// <summary>
    /// Classe de serviço para a criação de Tokens Web JSON (JWT).
    /// Esta classe é responsável por gerar JWTs para a autenticação de utilizadores.
    /// </summary>
    public class JWTService
    {
        private readonly IConfiguration _config;
        private readonly SymmetricSecurityKey _jwtKey;

        /// <summary>
        /// Inicializa uma nova instância da classe JWTService.
        /// </summary>
        /// <param name="config">Objeto de configuração para acessar as definições da aplicação.</param>
        public JWTService(IConfiguration config)
        {
            _config = config;
            // Convert the key string from the configuration into bytes to be used as a symmetric security key.
            // This key is used to encrypt and decrypt the tokens.
            _jwtKey = new SymmetricSecurityKey(Encoding.UTF8.GetBytes(_config["JWT:Key"]));
        }

        /// <summary>
        /// Cria um JWT para um dado utilizador.
        /// </summary>
        /// <param name="user">O utilizador para o qual o JWT será criado.</param>
        /// <returns>Uma string representando o token JWT serializado.</returns>
        public string CreateJWT(User user)
        {
            // Claims are the pieces of data included within the token.
            var userClaims = new List<Claim>
            {
                new(ClaimTypes.NameIdentifier, user.Id),
                new("UserName", user.UserName),
                new(ClaimTypes.Email, user.Email),
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
