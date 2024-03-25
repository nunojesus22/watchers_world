using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;
using WatchersWorld.Server.Controllers;
using WatchersWorld.Server.Data;
using WatchersWorld.Server.Models;

namespace WatchersWorld.Server.Services
{
    public interface IFollowersService
    {
        Task<bool> Follow(string userIdAuthenticated, string userIdToFollow);
        Task<bool> Unfollow(string followerId, string followingId);
        Task<List<string>> GetFollowers(string whosBeingFollowedId);
        Task<List<string>> GetWhoFollow(string whosFollowingId);
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

            bool alreadyFollows = await AlreadyFollow(followerId, followingId);
            if (alreadyFollows) return false;

            var follower = new Followers
            {
                WhosFollowing = followerId,
                WhosBeingFollowed = followingId,
            };

            try
            {
                _context.Followers.Add(follower);
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

            bool alreadyFollows = await AlreadyFollow(followerId, followingId);
            if (!alreadyFollows) return false;


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
            var followersId = await _context.Followers.Where(f => f.WhosBeingFollowed == whosBeingFollowedId)
                                                        .Select(f => f.WhosFollowing)
                                                        .ToListAsync();

            return followersId;
        }

        public async Task<List<string>> GetWhoFollow(string whosFollowingId)
        {
            var whoFollowId = await _context.Followers.Where(f => f.WhosFollowing == whosFollowingId)
                                                        .Select(f => f.WhosBeingFollowed)
                                                        .ToListAsync();

            return whoFollowId;
        }

        public async Task<bool> AlreadyFollow(string followerId, string followingId)
        {
            var followsId = await GetFollowId(followerId, followingId);
            return followsId != null;
        }

        private async Task<Guid?> GetFollowId(string followerId, string followingId)
        {
            var follow = await _context.Followers.FirstOrDefaultAsync(f => f.WhosFollowing == followerId && f.WhosBeingFollowed == followingId);

            return follow?.FollowersId;
        }


    }
}
