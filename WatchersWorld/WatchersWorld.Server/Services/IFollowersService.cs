using Microsoft.EntityFrameworkCore;
using WatchersWorld.Server.Data;
using WatchersWorld.Server.Models.Authentication;
using WatchersWorld.Server.Models.Followers;

namespace WatchersWorld.Server.Services
{
    public interface IFollowersService
    {
        Task<bool> Follow(string userIdAuthenticated, string userIdToFollow);
        Task<bool> Unfollow(string followerId, string followingId);
        Task<List<string>> GetFollowers(string whosBeingFollowedId);
        Task<List<string>> GetWhoFollow(string whosFollowingId);
        Task<List<string>> GetPendingsSend(string whosFollowingId);
        Task<bool> AcceptFollowSend(string followingId, string followerId);
        Task<bool> RejectFollowSend(string followingId, string followerId);
        Task<bool> FollowIsPending(string followerId, string followingId);
        Task<bool> AlreadyFollow(string followerId, string followingId);

    }

    public class FollowersService: IFollowersService
    {
        private readonly WatchersWorldServerContext _context;

        public FollowersService(WatchersWorldServerContext context)
        {
            _context = context;
        }

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

        public async Task<List<string>> GetFollowers(string whosBeingFollowedId)
        {
            var followersId = await _context.Followers.Where(f => f.WhosBeingFollowed == whosBeingFollowedId && f.IsApproved == true)
                                                        .Select(f => f.WhosFollowing)
                                                        .ToListAsync();

            return followersId;
        }

        public async Task<List<string>> GetWhoFollow(string whosFollowingId)
        {
            var whoFollowId = await _context.Followers.Where(f => f.WhosFollowing == whosFollowingId && f.IsApproved == true)
                                                        .Select(f => f.WhosBeingFollowed)
                                                        .ToListAsync();

            return whoFollowId;
        }

        public async Task<List<string>> GetPendingsSend(string whosBeingFollowedId)
        {
            var followersId = await _context.Followers.Where(f => f.WhosBeingFollowed == whosBeingFollowedId && f.IsApproved == false)
                                                        .Select(f => f.WhosFollowing)
                                                        .ToListAsync();

            return followersId;
        }

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

        private async Task<Guid?> GetFollowId(string followerId, string followingId)
        {
            var follow = await _context.Followers.FirstOrDefaultAsync(f => f.WhosFollowing == followerId && f.WhosBeingFollowed == followingId);

            return follow?.FollowersId;
        }
    }
}
