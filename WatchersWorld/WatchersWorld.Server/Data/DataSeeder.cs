using Microsoft.AspNetCore.Identity;
using WatchersWorld.Server.Models.Authentication;
using WatchersWorld.Server.Models.Gamification;

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
        public static async Task SeedData(WatchersWorldServerContext context, UserManager<User> userManager, RoleManager<IdentityRole> roleManager) 
        {
            // Seed roles
            if (roleManager != null)
            {
                await EnsureRolesAsync(roleManager);
            }

            // Seed the admin user
            await EnsureAdminUserAsync(userManager, roleManager);

            // Seed test users
            await SeedTestUser(context, userManager, roleManager);

            await SeedMedalsAsync(context);

        }


        private static async Task EnsureRolesAsync(RoleManager<IdentityRole> roleManager)
        {
            string[] roles = ["Admin", "Moderator", "User"];

            foreach (string role in roles)
            {
                if (!await roleManager.RoleExistsAsync(role))
                {
                    await roleManager.CreateAsync(new IdentityRole(role));
                }
            }
        }

        private static async Task EnsureAdminUserAsync(UserManager<User> userManager, RoleManager<IdentityRole> roleManager)
        {
            string adminEmail = "admin@admin.com";
            string adminPassword = "Teste1234";

            var adminUser = await userManager.FindByEmailAsync(adminEmail);
            if (adminUser == null)
            {
                adminUser = new User
                {
                    UserName = adminEmail,
                    Email = adminEmail,
                    EmailConfirmed = true,
                    Provider = "Credentials",

                };

                var createUserResult = await userManager.CreateAsync(adminUser, adminPassword);
                if (createUserResult.Succeeded && roleManager != null)
                {
                    await userManager.AddToRoleAsync(adminUser, "Admin");
                }
            }
        }

        /// <summary>
        /// Semeia utilizadores de teste no contexto e no gestor de utilizadores.
        /// </summary>
        /// <param name="context">Contexto do servidor WatchersWorld.</param>
        /// <param name="userManager">Gestor de utilizadores.</param>
        /// <returns>Tarefa assíncrona.</returns>
        private static async Task SeedTestUser(WatchersWorldServerContext context, UserManager<User> userManager, RoleManager<IdentityRole> roleManager)
        {
            await AddUserWithProfileAsync(context, userManager, roleManager, "usertest1@gmail.com", "UserTest1", "google", true, "Public");
            await AddUserWithProfileAsync(context, userManager, roleManager, "usertest2@gmail.com", "UserTest2", "Credentials", true, "Public");
            await AddUserWithProfileAsync(context, userManager, roleManager, "usertest3@gmail.com", "UserTest3", "Credentials", true, "Public");
            await AddUserWithProfileAsync(context, userManager, roleManager, "usertest4@gmail.com", "UserTest4", "Credentials", true, "Public");
            await AddUserWithProfileAsync(context, userManager, roleManager, "usertest5@gmail.com", "UserTest5", "Credentials", true, "Private");
            await AddUserWithProfileAsync(context, userManager, roleManager, "usertest6@gmail.com", "UserTest6", "Credentials", true, "Private");
            await AddUserWithProfileAsync(context, userManager, roleManager, "usertest7@gmail.com", "UserTest7", "Credentials", true, "Private");
        }

        /// <summary>
        /// Adiciona um utilizador com perfil ao contexto e ao gestor de utilizadores.
        /// </summary>
        /// <param name="context">Contexto do servidor WatchersWorld.</param>
        /// <param name="userManager">Gestor de utilizadores.</param>
        /// <param name="roleManager">Gestor de roles dos utilizadores.</param>
        /// <param name="email">Email do utilizador.</param>
        /// <param name="userName">Nome de utilizador.</param>
        /// <param name="provider">Provedor de autenticação.</param>
        /// <param name="emailConfirmed">Indica se o email está confirmado.</param>
        /// <param name="profileStatus">Estado do perfil (Público ou Privado).</param>
        /// <returns>Tarefa assíncrona.</returns>
        private static async Task AddUserWithProfileAsync(WatchersWorldServerContext context, UserManager<User> userManager, RoleManager<IdentityRole> roleManager, string email, string userName, string provider, bool emailConfirmed, string profileStatus = "Public")
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

            if (roleManager != null)
            {
                var roleResult = await userManager.AddToRoleAsync(user, "User");
                if (!roleResult.Succeeded)
                {
                    throw new Exception("Failed to assign role to user: " + roleResult.Errors.FirstOrDefault()?.Description);
                }
            }

            var userProfile = new ProfileInfo
            {
                UserId = user.Id,
                UserName = user.UserName,
                Description = "Description for " + userName,
                Gender = 'M',
                BirthDate = DateTime.Now.AddYears(-20),
                ProfileStatus = profileStatus,
                ProfilePhoto = "assets/img/nuno-pfp.png",
                CoverPhoto = "assets/img/pfp2.png",
                Following = 0,
                Followers = 0
            };

            context.ProfileInfo.Add(userProfile);
            await context.SaveChangesAsync();
        }

        public static async Task SeedMedalsAsync(WatchersWorldServerContext context)
        {
            if (!context.Medals.Any()) // Check if the Medals table is empty
            {
                var medals = new List<Medals>
        {
            new Medals { Name = "First Movie", Description = "Marcar 1 filme como visto", Image = "path_to_medal_image", AcquiredDate = null },
            new Medals { Name = "Account Creation", Description = "Criar uma conta", Image = "path_to_medal_image", AcquiredDate = null },
            // Add more medals as needed
        };

                context.Medals.AddRange(medals);
                await context.SaveChangesAsync();
            }
        }


    }
}
