using Microsoft.AspNetCore.Identity;
using WatchersWorld.Server.Models.Authentication;

namespace WatchersWorld.Server.Data
{
    /// <summary>
    /// Classe responsável pela inicialização dos dados no contexto do servidor WatchersWorld.
    /// Inclui métodos para criar utilizadores de teste e respetivos perfis no arranque da aplicação.
    /// </summary>
    public class DataSeeder
    {
        /// <summary>
        /// Semeia dados de teste no contexto e no gestor de utilizadores.
        /// </summary>
        /// <param name="context">Contexto do servidor WatchersWorld.</param>
        /// <param name="userManager">Gestor de utilizadores.</param>
        /// <returns>Tarefa assíncrona.</returns>
        public static async Task SeedData(WatchersWorldServerContext context, UserManager<User> userManager) 
        {
            await SeedTestUser(context, userManager);
        }

        /// <summary>
        /// Semeia utilizadores de teste no contexto e no gestor de utilizadores.
        /// </summary>
        /// <param name="context">Contexto do servidor WatchersWorld.</param>
        /// <param name="userManager">Gestor de utilizadores.</param>
        /// <returns>Tarefa assíncrona.</returns>
        private static async Task SeedTestUser(WatchersWorldServerContext context, UserManager<User> userManager)
        {
            await AddUserWithProfileAsync(context, userManager, "usertest1@gmail.com", "UserTest1", "google", true, "Public");
            await AddUserWithProfileAsync(context, userManager, "usertest2@gmail.com", "UserTest2", "Credentials", true, "Public");
            await AddUserWithProfileAsync(context, userManager, "usertest3@gmail.com", "UserTest3", "Credentials", true, "Public");
            await AddUserWithProfileAsync(context, userManager, "usertest4@gmail.com", "UserTest4", "Credentials", true, "Public");
            await AddUserWithProfileAsync(context, userManager, "usertest5@gmail.com", "UserTest5", "Credentials", true, "Private");
            await AddUserWithProfileAsync(context, userManager, "usertest6@gmail.com", "UserTest6", "Credentials", true, "Private");
            await AddUserWithProfileAsync(context, userManager, "usertest6@gmail.com", "UserTest7", "Credentials", true, "Private");
        }

        /// <summary>
        /// Adiciona um utilizador com perfil ao contexto e ao gestor de utilizadores.
        /// </summary>
        /// <param name="context">Contexto do servidor WatchersWorld.</param>
        /// <param name="userManager">Gestor de utilizadores.</param>
        /// <param name="email">Email do utilizador.</param>
        /// <param name="userName">Nome de utilizador.</param>
        /// <param name="provider">Provedor de autenticação.</param>
        /// <param name="emailConfirmed">Indica se o email está confirmado.</param>
        /// <param name="profileStatus">Estado do perfil (Público ou Privado).</param>
        /// <returns>Tarefa assíncrona.</returns>
        private static async Task AddUserWithProfileAsync(WatchersWorldServerContext context, UserManager<User> userManager, string email, string userName, string provider, bool emailConfirmed, string profileStatus = "Public")
        {
            var user = new User
            {
                Email = email,
                UserName = userName,
                Provider = provider,
                EmailConfirmed = emailConfirmed,
            };

            var result = await userManager.CreateAsync(user, user.UserName);
            if (!result.Succeeded)
            {
                throw new Exception("Failed to create user: " + result.Errors.FirstOrDefault()?.Description);
            }

            var userProfile = new ProfileInfo
            {
                UserId = user.Id,
                UserName = user.UserName,
                Description = "Description for " + userName,
                Gender = 'M',
                BirthDate = DateTime.Now.AddYears(-20),
                ProfileStatus = profileStatus,
                ProfilePhoto = "assets/img/pfp2.png",
                CoverPhoto = "assets/img/pfp2.png",
                Following = 0,
                Followers = 0
            };

            context.ProfileInfo.Add(userProfile);
            await context.SaveChangesAsync();
        }

    }
}
