using Microsoft.AspNetCore.Identity;
using Microsoft.EntityFrameworkCore;
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
            await SeedUserMedalsAsync(context, userManager);


        }

        /// <summary>
        /// Garante a criação de roles necessárias para o sistema.
        /// </summary>
        /// <param name="roleManager">Gestor de roles para a criação de roles.</param>
        /// <returns>Tarefa assíncrona que indica o sucesso ou falha na criação das roles.</returns>
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

        /// <summary>
        /// Garante a criação e configuração de uma conta administrativa padrão.
        /// </summary>
        /// <param name="userManager">Gestor de utilizadores para a criação de contas de utilizador.</param>
        /// <param name="roleManager">Gestor de roles para a atribuição de roles.</param>
        /// <returns>Tarefa assíncrona que indica o sucesso ou falha na criação do utilizador administrador.</returns>
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
        /// Semeia utilizadores de teste com perfis pré-configurados no sistema.
        /// </summary>
        /// <param name="context">Contexto do servidor para operações de base de dados.</param>
        /// <param name="userManager">Gestor de utilizadores para a criação de contas de utilizador.</param>
        /// <param name="roleManager">Gestor de roles para a atribuição de roles aos utilizadores.</param>
        /// <returns>Tarefa assíncrona que reflete o estado da operação de seeding dos utilizadores de teste.</returns>
        private static async Task SeedTestUser(WatchersWorldServerContext context, UserManager<User> userManager, RoleManager<IdentityRole> roleManager)
        {
            await AddUserWithProfileAsync(context, userManager, roleManager, "usertest1@gmail.com", "UserTest1", "google", true, "Public");
            await AddUserWithProfileAsync(context, userManager, roleManager, "usertest2@gmail.com", "UserTest2", "Credentials", true, "Public");
            await AddUserWithProfileAsync(context, userManager, roleManager, "usertest3@gmail.com", "UserTest3", "Credentials", true, "Public");
            await AddUserWithProfileAsync(context, userManager, roleManager, "usertest4@gmail.com", "UserTest4", "Credentials", true, "Public");
            await AddUserWithProfileAsync(context, userManager, roleManager, "usertest5@gmail.com", "UserTest5", "Credentials", true, "Private");
            await AddUserWithProfileAsync(context, userManager, roleManager, "usertest6@gmail.com", "UserTest6", "Credentials", true, "Private");
            await AddUserWithProfileAsync(context, userManager, roleManager, "usertest7@gmail.com", "UserTest7", "Credentials", true, "Private");
            await AddUserWithProfileAsync(context, userManager, roleManager, "usertest8@gmail.com", "UserTest8", "Credentials", true, "Public");
            await AddUserWithProfileAsync(context, userManager, roleManager, "usertest9@gmail.com", "UserTest9", "Credentials", true, "Public");
            await AddUserWithProfileAsync(context, userManager, roleManager, "usertest10@gmail.com", "UserTest10", "Credentials", true, "Public");
            await AddUserWithProfileAsync(context, userManager, roleManager, "usertest11@gmail.com", "UserTest11", "Credentials", true, "Private");
            await AddUserWithProfileAsync(context, userManager, roleManager, "usertest12@gmail.com", "UserTest12", "Credentials", true, "Public");
            await AddUserWithProfileAsync(context, userManager, roleManager, "usertest13@gmail.com", "UserTest13", "Credentials", true, "Private");
            await AddUserWithProfileAsync(context, userManager, roleManager, "usertest14@gmail.com", "UserTest14", "Credentials", true, "Public");
            await AddUserWithProfileAsync(context, userManager, roleManager, "usertest15@gmail.com", "UserTest15", "Credentials", true, "Public");

        }

        /// <summary>
        /// Adiciona um único utilizador com perfil ao sistema.
        /// </summary>
        /// <param name="context">Contexto do servidor.</param>
        /// <param name="userManager">Gestor de utilizadores.</param>
        /// <param name="roleManager">Gestor de roles.</param>
        /// <param name="email">Email do utilizador.</param>
        /// <param name="userName">Nome de utilizador.</param>
        /// <param name="provider">Provedor de autenticação do utilizador.</param>
        /// <param name="emailConfirmed">Indica se o email está confirmado.</param>
        /// <param name="profileStatus">Estado do perfil do utilizador.</param>
        /// <returns>Tarefa assíncrona indicando o sucesso ou falha na adição do utilizador e seu perfil.</returns>
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

        /// <summary>
        /// Semeia medalhas no contexto do banco de dados, se ainda não existirem.
        /// </summary>
        /// <param name="context">Contexto do servidor WatchersWorld para operações de base de dados.</param>
        /// <returns>Uma tarefa assíncrona que reflete o estado da operação de seeding das medalhas.</returns>
        /// <remarks>
        /// Este método adiciona um conjunto inicial de medalhas ao banco de dados se a tabela de medalhas estiver vazia.
        /// Cada medalha é definida com um nome, descrição e um caminho para uma imagem representativa.
        /// </remarks>
        public static async Task SeedMedalsAsync(WatchersWorldServerContext context)
        {
            if (!context.Medals.Any()) // Check if the Medals table is empty
            {
                var medals = new List<Medals>
                {
                    new Medals { Name = "Conta Criada", Description = "Criar uma conta", Image = "../../assets/img/medal.png"},
                    new Medals { Name = "Primeiro Filme", Description = "Marcar 1 filme como visto", Image = "../../assets/img/medal.png"},
                    new Medals { Name = "Primeira Série", Description = "Marcar 1 série como visto", Image = "../../assets/img/medal.png"},
                    new Medals { Name = "Seguir um utilizador", Description = "Seguir o seu primeiro utilizador", Image = "../../assets/img/medal.png"},
                    new Medals { Name = "Editar perfil", Description = "Editar o perfil pela primeira vez", Image = "../../assets/img/medal.png"},
                    // Add more medals as needed
                }; 

                context.Medals.AddRange(medals);
                await context.SaveChangesAsync();
            }
        }

        /// <summary>
        /// Atribui medalhas a utilizadores específicos baseado numa lista pré-definida de e-mails e nomes de medalhas.
        /// </summary>
        /// <param name="context">Contexto do servidor WatchersWorld para operações de base de dados.</param>
        /// <param name="userManager">Gestor de utilizadores para identificação e manipulação de contas de utilizador.</param>
        /// <returns>Uma tarefa assíncrona que indica o sucesso ou falha na atribuição de medalhas.</returns>
        /// <remarks>
        /// Este método percorre uma lista de pares de e-mail e nome de medalha, atribuindo medalhas aos utilizadores correspondentes.
        /// Ele verifica se o utilizador e a medalha existem e, em seguida, adiciona a medalha ao perfil do utilizador se ela ainda não foi concedida.
        /// </remarks>
        private static async Task SeedUserMedalsAsync(WatchersWorldServerContext context, UserManager<User> userManager)
        {
            // Assume you have a list of user email addresses and corresponding medals they should receive
            var userMedalsInfo = new List<(string userEmail, string medalName)>
        {
            ("usertest1@gmail.com", "Conta Criada"),
            ("usertest2@gmail.com", "Conta Criada"),
            ("usertest3@gmail.com", "Conta Criada"),
            ("usertest4@gmail.com", "Conta Criada"),
            ("usertest5@gmail.com", "Conta Criada"),
            ("usertest6@gmail.com", "Conta Criada"),
            ("usertest7@gmail.com", "Conta Criada"),
            ("usertest8@gmail.com", "Conta Criada"),
            ("usertest9@gmail.com", "Conta Criada"),
            ("usertest10@gmail.com", "Conta Criada"),
            ("usertest11@gmail.com", "Conta Criada"),
            ("usertest12@gmail.com", "Conta Criada"),
            ("usertest13@gmail.com", "Conta Criada"),
            ("usertest14@gmail.com", "Conta Criada"),
            ("usertest15@gmail.com", "Conta Criada"),
        };

            foreach (var (userEmail, medalName) in userMedalsInfo)
            {
                var user = await userManager.FindByEmailAsync(userEmail);
                if (user != null)
                {
                    var medal = await context.Medals.FirstOrDefaultAsync(m => m.Name == medalName);
                    if (medal != null)
                    {
                        var userMedal = new UserMedal
                        {
                            UserName = user.UserName,
                            MedalId = medal.Id,
                            AcquiredDate = DateTime.UtcNow // or any other logic to set the date
                        };

                        // Prevent duplicate medals for the same user
                        var existingUserMedal = await context.UserMedals
                            .FirstOrDefaultAsync(um => um.UserName == user.UserName && um.MedalId == medal.Id);
                        if (existingUserMedal == null)
                        {
                            context.UserMedals.Add(userMedal);
                        }
                    }
                }
            }

            await context.SaveChangesAsync();
        }


    }
}
