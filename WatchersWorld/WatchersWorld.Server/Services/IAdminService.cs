using Microsoft.AspNetCore.Identity;
using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;
using WatchersWorld.Server.Data;
using WatchersWorld.Server.Models.Authentication;

namespace WatchersWorld.Server.Services
{
    public interface IAdminService
    {
        Task<string[]> GetUserRoleAsync(string username);
        Task<string> BanUserPermanentlyAsync(string username);
        Task<string> BanUserTemporarilyAsync(string username, int banDurationInDays);
        Task<string> UnbanUserAsync(string username);
        Task<string> DeleteUserByUsernameAsync(string username);
        Task<string> ChangeRoleToModeratorAsync(string username);
        Task<string> ChangeRoleToUserAsync(string username);
    }

    public class AdminService : IAdminService
    {
        private readonly UserManager<User> _userManager;
        private readonly WatchersWorldServerContext _context;
        private readonly ILogger<AdminService> _logger;

        public AdminService(UserManager<User> userManager, WatchersWorldServerContext context, ILogger<AdminService> logger)
        {
            _userManager = userManager;
            _context = context;
            _logger = logger;

        }


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
