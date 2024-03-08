using Microsoft.AspNetCore.Identity;
using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;
using WatchersWorld.Server.Data;
using WatchersWorld.Server.Models;
using static System.Runtime.InteropServices.JavaScript.JSType;

namespace WatchersWorld.Server.Controllers
{
    public class FollowersController : ControllerBase
    {
        private readonly WatchersWorldServerContext _context;

        public FollowersController(WatchersWorldServerContext context)
        {
            _context = context;
        }

        public async Task<IActionResult> Follow(string followerId, string followingId)
        {
            if (!ModelState.IsValid)
            {
                var errors = ModelState
                    .Where(x => x.Value.Errors.Any())
                    .Select(kvp => new {
                        Field = kvp.Key,
                        Message = kvp.Value.Errors.First().ErrorMessage
                    }).ToList();

                return BadRequest(new { Errors = errors });
            }

            bool alreadyFollows = await AlreadyFollow(followerId, followingId);

            if (alreadyFollows)
            {
                return BadRequest(new { Message = "O utilizador já segue o utilizador pretendido!" });
            }

            var follower = new Followers
            {
                WhosFollowing = followerId,
                WhosBeingFollowed = followingId,
            };

            _context.Followers.Add(follower);
            await _context.SaveChangesAsync();

            return Ok();
        }

        public async Task<IActionResult> Unfollow(string followerId, string followingId)
        {
            if (!ModelState.IsValid)
            {
                var errors = ModelState
                    .Where(x => x.Value.Errors.Any())
                    .Select(kvp => new {
                        Field = kvp.Key,
                        Message = kvp.Value.Errors.First().ErrorMessage
                    }).ToList();

                return BadRequest(new { Errors = errors });
            }

            bool alreadyFollows = await AlreadyFollow(followerId, followingId);

            if (!alreadyFollows)
            {
                return BadRequest(new { Message = "O utilizador não segue o utilizador pretendido!" });
            }

            var followsId = await GetFollowId(followerId, followingId);

            var follower = await _context.Followers.FindAsync(followsId);
            _context.Followers.Remove(follower);
            await _context.SaveChangesAsync();

            return Ok();
        }

        public async Task<IActionResult> GetFollowers(string whosBeingFollowedId)
        {
            if (!ModelState.IsValid)
            {
                var errors = ModelState
                    .Where(x => x.Value.Errors.Any())
                    .Select(kvp => new {
                        Field = kvp.Key,
                        Message = kvp.Value.Errors.First().ErrorMessage
                    }).ToList();

                return BadRequest(new { Errors = errors });
            }

            var followersId = await _context.Followers.Where(f => f.WhosBeingFollowed == whosBeingFollowedId)
                                                        .Select(f => f.WhosFollowing)
                                                        .ToListAsync();
            
            return Ok(followersId);
        }

        public async Task<IActionResult> GetWhoFollow(string whosFollowingId)
        {
            if (!ModelState.IsValid)
            {
                var errors = ModelState
                    .Where(x => x.Value.Errors.Any())
                    .Select(kvp => new {
                        Field = kvp.Key,
                        Message = kvp.Value.Errors.First().ErrorMessage
                    }).ToList();

                return BadRequest(new { Errors = errors });
            }

            var whoFollowId = await _context.Followers.Where(f => f.WhosFollowing == whosFollowingId)
                                                        .Select(f => f.WhosBeingFollowed)
                                                        .ToListAsync();

            return Ok(whoFollowId);
        }

        private async Task<bool> AlreadyFollow(string followerId, string followingId)
        {
            var followsId = await GetFollowId(followerId, followingId);

            if (followsId != null)
            {
                return true;
            }

            return false;
        }

        private async Task<string> GetFollowId(string followerId, string followingId)
        {
            var follow = await _context.Followers.FirstOrDefaultAsync(f => f.WhosFollowing == followerId && f.WhosBeingFollowed == followingId);
            
            return follow.FollowersId;
        }


    }


}
