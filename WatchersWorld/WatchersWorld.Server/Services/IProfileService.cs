using Microsoft.AspNetCore.Identity;
using Microsoft.EntityFrameworkCore;
using WatchersWorld.Server.Data;
using WatchersWorld.Server.DTOs.ProfileInfoDtos;
using WatchersWorld.Server.Models.Authentication;

namespace WatchersWorld.Server.Services
{
    /// <summary>
    /// Interface que define operações de serviço para gestão de perfis de utilizadores.
    /// </summary>
    public interface IProfileService
    {
        /// <summary>
        /// Obtém as informações do perfil de um utilizador com base no seu nome de utilizador.
        /// </summary>
        /// <param name="username">O nome de utilizador para o qual o perfil é requerido.</param>
        /// <returns>Os detalhes do perfil do utilizador como um DTO de ProfileInfo.</returns>
        Task<ProfileInfoDto> GetUserProfileAsync(string username);

        /// <summary>
        /// Atualiza as informações de perfil de um utilizador.
        /// </summary>
        /// <param name="userId">O identificador do utilizador cujo perfil será atualizado.</param>
        /// <param name="profileInfo">Um DTO contendo as novas informações do perfil.</param>
        /// <returns>True se a atualização for bem-sucedida, caso contrário false.</returns>
        Task<bool> UpdateUserProfileAsync(string userId, ProfileInfoDto profileInfo);

        /// <summary>
        /// Exclui a conta e as informações de perfil de um utilizador.
        /// </summary>
        /// <param name="username">O nome de utilizador da conta a ser excluída.</param>
        /// <returns>Uma mensagem indicando o sucesso ou falha da operação.</returns>
        Task<string> DeleteOwnAccountAsync(string username);

    }

    /// <summary>
    /// Serviço para a gestão de perfis.
    /// </summary>
    /// <remarks>
    /// Inicializa uma nova instância da classe <see cref="ProfileService"/>.
    /// </remarks>
    /// <param name="context">O contexto da base de dados.</param>
    public class ProfileService : IProfileService
    {
        private readonly UserManager<User> _userManager;
        private readonly WatchersWorldServerContext _context;

        public ProfileService(UserManager<User> userManager, WatchersWorldServerContext context)
        {
            _userManager = userManager;
            _context = context;
        }

        public async Task<ProfileInfoDto> GetUserProfileAsync(string username)
        {
            var user = await _context.ProfileInfo
             .FirstOrDefaultAsync(p => p.UserName == username);

            if (user == null)
            {
                throw new NullReferenceException("Não foi possível encontrar o utilizador");
            }

            var data = _context.ProfileInfo.FirstOrDefault(p => p.UserName == user.UserName);

            return new ProfileInfoDto
            {
                UserName = data.UserName,
                Description = data.Description,
                BirthDate = data.BirthDate,
                Gender = data.Gender,
                ProfilePhoto = data.ProfilePhoto,
                CoverPhoto = data.CoverPhoto,
                ProfileStatus = data.ProfileStatus,
                Followers = data.Followers,
                Following = data.Following
            };
        }

        public async Task<bool> UpdateUserProfileAsync(string userId, ProfileInfoDto profileInfo)
        {
            var user = await _context.ProfileInfo
            .FirstOrDefaultAsync(p => p.UserId == userId);

            if (user == null)
            {
                throw new NullReferenceException("Não foi possível encontrar o utilizador");
            }

            user.Description = profileInfo.Description;
            user.Gender = profileInfo.Gender;
            user.BirthDate = profileInfo.BirthDate;
            user.CoverPhoto = profileInfo.CoverPhoto;
            user.ProfilePhoto = profileInfo.ProfilePhoto;
            user.ProfileStatus = profileInfo.ProfileStatus;
            user.Followers = profileInfo.Followers;
            user.Following = profileInfo.Following;

            var result = await _context.SaveChangesAsync();
            return result > 0;
        }

        public async Task<string> DeleteOwnAccountAsync(string username)
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
                    return "Your account and profile info have been successfully deleted.";
                }
                catch (Exception)
                {
                    await transaction.RollbackAsync();
                    return "An error occurred while deleting your account and profile info.";
                }
            }
        }
    }
}

