using Microsoft.AspNetCore.Identity;
using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;
using WatchersWorld.Server.Data;
using WatchersWorld.Server.Models.Authentication;

namespace WatchersWorld.Server.Services
{
    /// <summary>
    /// Define as operações administrativas sobre os utilizadores.
    /// </summary>
    public interface IAdminService
    {
        /// <summary>
        /// Obtém as roles de um utilizador especificado.
        /// </summary>
        /// <param name="username">O nome de utilizador.</param>
        /// <returns>Array de strings contendo as roles do utilizador.</returns>
        Task<string[]> GetUserRoleAsync(string username);

        /// <summary>
        /// Bane permanente o utilizador.
        /// </summary>
        /// <param name="username">O nome de utilizador.</param>
        /// <returns>Mensagem indicando o sucesso ou falha da operação.</returns>
        Task<string> BanUserPermanentlyAsync(string username);

        /// <summary>
        /// Bane temporariamente o utilizador.
        /// </summary>
        /// <param name="username">O nome de utilizador.</param>
        /// <param name="banDurationInDays">A duração em dias.</param>
        /// <returns>Mensagem indicando o sucesso ou falha da operação.</returns>
        Task<string> BanUserTemporarilyAsync(string username, int banDurationInDays);

        /// <summary>
        /// Remove o ban de um utilizador.
        /// </summary>
        /// <param name="username">O nome de utilizador.</param>
        /// <returns>Mensagem indicando o sucesso ou falha da operação.</returns>
        Task<string> UnbanUserAsync(string username);

        /// <summary>
        /// Apaga a conta de um utilizador e as suas informações relacionadas.
        /// </summary>
        /// <param name="username">O nome de utilizador.</param>
        /// <returns>Mensagem indicando o sucesso ou falha da operação.</returns>
        Task<string> DeleteUserByUsernameAsync(string username);

        /// <summary>
        /// Altera a role de um utilizador para Moderator.
        /// </summary>
        /// <param name="username">O nome de utilizador.</param>
        /// <returns>Mensagem indicando o sucesso ou falha da operação.</returns>
        Task<string> ChangeRoleToModeratorAsync(string username);

        /// <summary>
        /// Altera a role de um utilizador para User.
        /// </summary>
        /// <param name="username">O nome de utilizador.</param>
        /// <returns>Mensagem indicando o sucesso ou falha da operação.</returns>
        Task<string> ChangeRoleToUserAsync(string username);
    }

    /// <summary>
    /// Implementação das operações administrativas sobre os utilizadores.
    /// </summary>
    public class AdminService : IAdminService
    {
        private readonly UserManager<User> _userManager;
        private readonly WatchersWorldServerContext _context;
        private readonly ILogger<AdminService> _logger;


        /// <summary>
        /// Inicializa uma nova instância da classe <see cref="AdminService"/>.
        /// </summary>
        /// <param name="userManager">Gere os utilizadores.</param>
        /// <param name="context">O contexto da base de dados.</param>
        /// <param name="logger">O logger.</param>
        public AdminService(UserManager<User> userManager, WatchersWorldServerContext context, ILogger<AdminService> logger)
        {
            _userManager = userManager;
            _context = context;
            _logger = logger;

        }

        /// <inheritdoc />

        public async Task<string[]> GetUserRoleAsync(string username)
        {
            var user = await _userManager.FindByNameAsync(username);
            if (user == null)
            {
                throw new KeyNotFoundException("User not found");
            }

            var roles = await _userManager.GetRolesAsync(user);
            return roles.ToArray();
        }


        /// <inheritdoc />

        public async Task<string> BanUserPermanentlyAsync(string username)
        {
            var user = await _userManager.FindByNameAsync(username);
            if (user == null)
            {
                return "User not found.";
            }

            var profileInfo = await _context.ProfileInfo.FirstOrDefaultAsync(p => p.UserName == username);
            if (profileInfo == null)
            {
                return "User profile info not found.";
            }

            profileInfo.StartBanDate = DateTime.UtcNow;
            profileInfo.EndBanDate = DateTime.MaxValue;

            _context.ProfileInfo.Update(profileInfo);
            await _context.SaveChangesAsync();

            return "User banned permanently.";
        }


        /// <inheritdoc />

        public async Task<string> BanUserTemporarilyAsync(string username, int banDurationInDays)
        {
            var user = await _userManager.FindByNameAsync(username);
            if (user == null)
            {
                return "User not found.";
            }

            var profileInfo = await _context.ProfileInfo.FirstOrDefaultAsync(p => p.UserName == username);
            if (profileInfo == null)
            {
                return "User profile info not found.";
            }

            profileInfo.StartBanDate = DateTime.UtcNow;
            profileInfo.EndBanDate = DateTime.UtcNow.AddDays(banDurationInDays);

            _context.ProfileInfo.Update(profileInfo);
            await _context.SaveChangesAsync();

            return $"User banned temporarily for {banDurationInDays} days.";
        }


        /// <inheritdoc />
        public async Task<string> UnbanUserAsync(string username)
        {
            var user = await _userManager.FindByNameAsync(username);
            if (user == null)
            {
                return "User not found.";
            }

            var profileInfo = await _context.ProfileInfo.FirstOrDefaultAsync(p => p.UserName == username);
            if (profileInfo == null)
            {
                return "User profile info not found.";
            }

            // Reset ban-related properties
            profileInfo.StartBanDate = null;
            profileInfo.EndBanDate = null;

            // Update the user's profile info in the database
            _context.ProfileInfo.Update(profileInfo);
            await _context.SaveChangesAsync();

            return "User unbanned successfully.";
        }


        /// <inheritdoc />

        public async Task<string> DeleteUserByUsernameAsync(string username)
        {
            using (var transaction = await _context.Database.BeginTransactionAsync())
            {
                try
                {
                    var profileInfo = await _context.ProfileInfo.FirstOrDefaultAsync(p => p.UserName == username);
                    if (profileInfo != null)
                    {
                        _context.ProfileInfo.Remove(profileInfo);
                        await _context.SaveChangesAsync();
                    }

                    var user = await _userManager.FindByNameAsync(username);
                    if (user == null)
                    {
                        return "User not found.";
                    }

                    var result = await _userManager.DeleteAsync(user);
                    if (!result.Succeeded)
                    {
                        return $"Error: {string.Join(", ", result.Errors.Select(e => e.Description))}";
                    }

                    await transaction.CommitAsync();
                    return "User and profile info successfully deleted.";
                }
                catch (Exception ex)
                {
                    await transaction.RollbackAsync();
                    _logger.LogError(ex, "An error occurred while deleting user and profile info.");
                    return "An error occurred while deleting the user and profile info.";
                }
            }
        }


        /// <inheritdoc />

        public async Task<string> ChangeRoleToModeratorAsync(string username)
        {
            var user = await _userManager.FindByNameAsync(username);
            if (user == null)
            {
                return "User not found.";
            }

            var currentRoles = await _userManager.GetRolesAsync(user);
            var removeResult = await _userManager.RemoveFromRolesAsync(user, currentRoles);
            if (!removeResult.Succeeded)
            {
                return "Failed to remove existing roles.";
            }

            var addResult = await _userManager.AddToRoleAsync(user, "Moderator");
            if (!addResult.Succeeded)
            {
                return "Failed to add user to moderator role.";
            }

            return "User role updated to Moderator successfully.";
        }


        /// <inheritdoc />

        public async Task<string> ChangeRoleToUserAsync(string username)
        {
            var user = await _userManager.FindByNameAsync(username);
            if (user == null)
            {
                return "User not found.";
            }

            var currentRoles = await _userManager.GetRolesAsync(user);
            var removeResult = await _userManager.RemoveFromRolesAsync(user, currentRoles);
            if (!removeResult.Succeeded)
            {
                return "Failed to remove existing roles.";
            }

            var addResult = await _userManager.AddToRoleAsync(user, "User");
            if (!addResult.Succeeded)
            {
                return "Failed to add user to user role.";
            }

            return "User role updated to User successfully.";
        }

    }

}
