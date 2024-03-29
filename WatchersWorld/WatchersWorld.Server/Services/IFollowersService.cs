using Microsoft.EntityFrameworkCore;
using WatchersWorld.Server.Data;
using WatchersWorld.Server.Models.Followers;

namespace WatchersWorld.Server.Services
{
    /// <summary>
    /// Interface que define operações para a gestão de seguidores.
    /// </summary>
    public interface IFollowersService
    {
        /// <summary>
        /// Segue um utilizador.
        /// </summary>
        /// <param name="userIdAuthenticated">Identificador do utilizador que segue.</param>
        /// <param name="userIdToFollow">Identificador do utilizador a ser seguido.</param>
        /// <returns>True se a operação for bem-sucedida, False caso contrário.</returns>
        Task<bool> Follow(string userIdAuthenticated, string userIdToFollow);

        /// <summary>
        /// Deixa de seguir um utilizador.
        /// </summary>
        /// <param name="followerId">Identificador do seguidor.</param>
        /// <param name="followingId">Identificador do utilizador seguido.</param>
        /// <returns>True se a operação for bem-sucedida, False caso contrário.</returns>
        Task<bool> Unfollow(string followerId, string followingId);

        /// <summary>
        /// Obtém os seguidores de um utilizador.
        /// </summary>
        /// <param name="whosBeingFollowedId">Identificador do utilizador seguido.</param>
        /// <returns>Lista dos identificadores dos seguidores.</returns>
        Task<List<string>> GetFollowers(string whosBeingFollowedId);

        /// <summary>
        /// Obtém quem um utilizador segue.
        /// </summary>
        /// <param name="whosFollowingId">Identificador do seguidor.</param>
        /// <returns>Lista dos identificadores dos utilizadores seguidos.</returns>
        Task<List<string>> GetWhoFollow(string whosFollowingId);

        /// <summary>
        /// Obtém os pedidos para seguir pendentes enviados para um utilizador.
        /// </summary>
        /// <param name="whosFollowingId">Identificador do utilizador que recebeu as solicitações.</param>
        /// <returns>Lista dos identificadores dos utilizadores que enviaram as solicitações.</returns>
        Task<List<string>> GetPendingsSend(string whosFollowingId);

        /// <summary>
        /// Aceita uma pedido para seguir pendente.
        /// </summary>
        /// <param name="followingId">Identificador do utilizador que recebeu a solicitação.</param>
        /// <param name="followerId">Identificador do utilizador que enviou a solicitação.</param>
        /// <returns>True se a operação for bem-sucedida, False caso contrário.</returns>
        Task<bool> AcceptFollowSend(string followingId, string followerId);

        /// <summary>
        /// Rejeita uma pedido para seguir pendente.
        /// </summary>
        /// <param name="followingId">Identificador do utilizador que recebeu a solicitação.</param>
        /// <param name="followerId">Identificador do utilizador que enviou a solicitação.</param>
        /// <returns>True se a operação for bem-sucedida, False caso contrário.</returns>
        Task<bool> RejectFollowSend(string followingId, string followerId);

        /// <summary>
        /// Verifica se uma solicitação de seguimento está pendente.
        /// </summary>
        /// <param name="followerId">Identificador do seguidor.</param>
        /// <param name="followingId">Identificador do utilizador seguido.</param>
        /// <returns>True se a solicitação estiver pendente, False caso contrário.</returns>
        Task<bool> FollowIsPending(string followerId, string followingId);

        /// <summary>
        /// Verifica se um utilizador já segue outro.
        /// </summary>
        /// <param name="followerId">Identificador do seguidor.</param>
        /// <param name="followingId">Identificador do utilizador seguido.</param>
        /// <returns>True se o utilizador já segue, False caso contrário.</returns>
        Task<bool> AlreadyFollow(string followerId, string followingId);

    }

    /// <summary>
    /// Serviço para a gestão de seguidores.
    /// </summary>
    /// <remarks>
    /// Inicializa uma nova instância da classe <see cref="FollowersService"/>.
    /// </remarks>
    /// <param name="context">O contexto da base de dados.</param>

    public class FollowersService(WatchersWorldServerContext context) : IFollowersService
    {
        private readonly WatchersWorldServerContext _context = context;

        /// <inheritdoc />
        public async Task<bool> Follow(string followerId, string followingId)
        {
            if (followerId == followingId) return false;

            bool isPending = await FollowIsPending(followerId, followingId);
            if (isPending) return false;

            bool alreadyFollows = await AlreadyFollow(followerId, followingId);
            if (alreadyFollows) return false;

            var profileStatus = await _context.ProfileInfo.Where(p => p.UserId == followingId).Select(p => p.ProfileStatus).SingleOrDefaultAsync();
            if (profileStatus == null) return false;
            
            var newFollower = new Followers
            {
                WhosFollowing = followerId,
                WhosBeingFollowed = followingId,
                IsApproved = profileStatus == "Public"
            };

            try
            {
                _context.Followers.Add(newFollower);
                await _context.SaveChangesAsync();
            }
            catch (Exception ex)
            {
                Console.Error.WriteLine(ex.Message);
                return false;
            }
            return true;
            
        }

        /// <inheritdoc />
        public async Task<bool> Unfollow(string followerId, string followingId)
        {
            if (followerId == followingId) return false;

            bool isPending = await FollowIsPending(followerId, followingId);
            bool alreadyFollows = await AlreadyFollow(followerId, followingId);
            if (!isPending && !alreadyFollows) return false;

            var followsId = await GetFollowId(followerId, followingId);
            var follower = await _context.Followers.FindAsync(followsId);
            try
            {
                _context.Followers.Remove(follower);
                await _context.SaveChangesAsync();
            }
            catch (Exception ex)
            {
                Console.Error.WriteLine(ex.Message);
                return false;
            }

            return true;
        }

        /// <inheritdoc />
        public async Task<List<string>> GetFollowers(string whosBeingFollowedId)
        {
            var followersId = await _context.Followers.Where(f => f.WhosBeingFollowed == whosBeingFollowedId && f.IsApproved == true)
                                                        .Select(f => f.WhosFollowing)
                                                        .ToListAsync();

            return followersId;
        }

        /// <inheritdoc />
        public async Task<List<string>> GetWhoFollow(string whosFollowingId)
        {
            var whoFollowId = await _context.Followers.Where(f => f.WhosFollowing == whosFollowingId && f.IsApproved == true)
                                                        .Select(f => f.WhosBeingFollowed)
                                                        .ToListAsync();

            return whoFollowId;
        }

        /// <inheritdoc />
        public async Task<List<string>> GetPendingsSend(string whosBeingFollowedId)
        {
            var followersId = await _context.Followers.Where(f => f.WhosBeingFollowed == whosBeingFollowedId && f.IsApproved == false)
                                                        .Select(f => f.WhosFollowing)
                                                        .ToListAsync();

            return followersId;
        }

        /// <inheritdoc />
        public async Task<bool> AcceptFollowSend(string followingId, string followerId)
        {
            var followId = await GetFollowId(followerId, followingId);

            if (followId != null)
            {
                try
                {
                    var follower = await _context.Followers.Where(f => f.FollowersId == followId).FirstAsync();
                    follower.IsApproved = true;

                    _context.Followers.Update(follower);
                    await _context.SaveChangesAsync();
                }
                catch (Exception ex)
                {
                    Console.Error.WriteLine(ex.Message);
                    return false;
                }

                return true;
            }

            return false;
        }

        /// <inheritdoc />
        public async Task<bool> RejectFollowSend(string followingId, string followerId)
        {
            var followId = await GetFollowId(followerId, followingId);

            if (followId != null)
            {
                try
                {
                    var follower = await _context.Followers.Where(f => f.FollowersId == followId).FirstAsync();

                    _context.Followers.Remove(follower);
                    await _context.SaveChangesAsync();
                }
                catch (Exception ex)
                {
                    Console.Error.WriteLine(ex.Message);
                    return false;
                }

                return true;
            }

            return false;
        }
        
        /// <inheritdoc />
        public async Task<bool> FollowIsPending(string followerId, string followingId)
        {
            var followId = await GetFollowId(followerId, followingId);

            if(followId != null)
            {
                var isApproved = await _context.Followers.Where(f => f.FollowersId == followId).Select(f => f.IsApproved).SingleAsync();
                return !isApproved;
            }

            return false;
        }

        /// <inheritdoc />
        public async Task<bool> AlreadyFollow(string followerId, string followingId)
        {
            var followsId = await GetFollowId(followerId, followingId);
            if (followsId != null)
            {
                
                var follower = await _context.Followers.Where(f => f.FollowersId == followsId).FirstAsync();
                return follower.IsApproved;
            }
            return false;
        }

        /// <summary>
        /// Obtém o identificador da relação de seguidores entre dois utilizadores.
        /// </summary>
        /// <param name="followerId">Identificador do utilizador que segue.</param>
        /// <param name="followingId">Identificador do utilizador que é seguido.</param>
        /// <returns>
        /// O identificador da relação de seguidores se existir; caso contrário, retorna null.
        /// Este identificador é útil para operações que necessitam referenciar uma relação específica de seguidores.
        /// </returns>
        private async Task<Guid?> GetFollowId(string followerId, string followingId)
        {
            var follow = await _context.Followers.FirstOrDefaultAsync(f => f.WhosFollowing == followerId && f.WhosBeingFollowed == followingId);

            return follow?.FollowersId;
        }
    }
}
