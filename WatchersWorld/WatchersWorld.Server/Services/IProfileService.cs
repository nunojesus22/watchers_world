using Microsoft.AspNetCore.Identity;
using Microsoft.EntityFrameworkCore;
using System.Linq;
using WatchersWorld.Server.Data;
using WatchersWorld.Server.DTOs.ProfileInfoDtos;
using WatchersWorld.Server.Models.Authentication;
using WatchersWorld.Server.Models.Chat;

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
            try
            {
                var user = await _userManager.FindByNameAsync(username);
                if (user == null)
                {
                    return "User not found.";
                }

                var favoriteActorChoice = await _context.FavoriteActorChoice.Where(m => m.UserThatChooseId == user.Id).ToListAsync();
                _context.FavoriteActorChoice.RemoveRange(favoriteActorChoice);

                var comments = await _context.Comments.Where(c => c.UserId == user.Id).ToListAsync();
                _context.Comments.RemoveRange(comments);

                var commentLikes = await _context.CommentLikes.Where(cl => cl.UserId == user.Id).ToListAsync();
                _context.CommentLikes.RemoveRange(commentLikes);

                var notifications = await _context.Notifications.Where(n => n.TriggeredByUserId == user.Id).ToListAsync();
                _context.Notifications.RemoveRange(notifications);

                var replyNotifications = await _context.ReplyNotifications.Where(rn => rn.TargetUserId == user.Id).ToListAsync();
                _context.ReplyNotifications.RemoveRange(replyNotifications);

                var followers = await _context.Followers.Where(f => f.WhosFollowing == user.Id || f.WhosBeingFollowed == user.Id).ToListAsync();
                _context.Followers.RemoveRange(followers);

                var followNotifications = await _context.FollowNotifications.Where(fn => fn.TriggeredByUserId == user.Id || fn.TargetUserId == user.Id).ToListAsync();
                _context.FollowNotifications.RemoveRange(followNotifications);

                var userMedals = await _context.UserMedals.Where(um => um.UserName == user.UserName).ToListAsync();
                _context.UserMedals.RemoveRange(userMedals);

                var messagesAsSender = await _context.Messages.Where(m => m.SendUserId == user.Id).ToListAsync();
                var messagesStatusAsReceiver = await _context.MessagesStatus.Where(ms => ms.RecipientUserId == user.Id).Select(ms => ms.MessageId).ToListAsync();

                var messagesAsReceiver = await _context.Messages.Where(m => messagesStatusAsReceiver.Contains(m.Id)).ToListAsync();

                var combinedMessages = new List<Messages>(messagesAsSender);
                combinedMessages.AddRange(messagesAsReceiver);

                var messageIds = combinedMessages.Select(m => m.Id).Distinct().ToList();

                var messagesVisibility = await _context.MessagesVisibility.Where(mv => messageIds.Contains(mv.MessageId)).ToListAsync();
                _context.MessagesVisibility.RemoveRange(messagesVisibility);

                var messagesStatuses = await _context.MessagesStatus.Where(ms => messageIds.Contains(ms.MessageId)).ToListAsync();
                _context.MessagesStatus.RemoveRange(messagesStatuses);

                var messagesNotifications = await _context.MessageNotifications.Where(mn => messageIds.Contains(mn.MessageId)).ToListAsync();
                _context.MessageNotifications.RemoveRange(messagesNotifications);

                _context.Messages.RemoveRange(combinedMessages);

                var chats = await _context.Chats.Where(c => c.User1Id == user.Id || c.User2Id == user.Id).ToListAsync();
                _context.Chats.RemoveRange(chats);

                var profileInfo = await _context.ProfileInfo.SingleOrDefaultAsync(pi => pi.UserName == username);
                if (profileInfo != null)
                {
                    _context.ProfileInfo.Remove(profileInfo);
                }

                var result = await _userManager.DeleteAsync(user);
                if (!result.Succeeded)
                {
                    return $"Error: {string.Join(", ", result.Errors.Select(e => e.Description))}";
                }

                await _context.SaveChangesAsync();
                return "Your account and profile info have been successfully deleted.";
            }
            catch (Exception ex)
            {
                return "An error occurred while deleting the user and profile info.";
            }

        }
    }
}

