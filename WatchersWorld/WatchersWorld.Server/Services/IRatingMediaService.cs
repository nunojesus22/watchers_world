using Microsoft.EntityFrameworkCore;
using WatchersWorld.Server.Data;
using WatchersWorld.Server.DTOs.Media;
using WatchersWorld.Server.Models.Media.FavoriteActor;
using WatchersWorld.Server.Models.Media.RatingMedia;
#nullable enable

namespace WatchersWorld.Server.Services
{
    public interface IRatingMediaService
    {
        Task<bool> GiveRatingToMedia(string userId, UserMediaDto media, int rating);
        Task<List<RatingPercentageDto>> GetRatesForMedia(int mediaId);
        Task<int> GetUserRate(string userId, int mediaId);
        Task<double> GetAverageRatingForMedia(int mediaId);
    }

    public class RatingMediaService : IRatingMediaService 
    {
        public WatchersWorldServerContext _context { get; set; }

        public RatingMediaService(WatchersWorldServerContext context)
        {
            _context = context;
        }

        public async Task<bool> GiveRatingToMedia(string userId, UserMediaDto media, int rating)
        {
            if(rating < 1 && rating > 5)
            {
                return false;
            }

            if (!await MediaAlreadyOnDatabase(media.MediaId))
            {
                var result = await AddMediaToDatabase(media);
                if (!result) return false;
            }

            try
            {
                var userRating = await UserAlreadyGiveRating(userId, media.MediaId);
                var mediaInfo = await _context.MediaInfoModel.Where(m => m.IdMedia == media.MediaId).FirstOrDefaultAsync();

                if (userRating != null)
                {
                    userRating.Rating = rating;
                    _context.UserRatingMedia.Update(userRating);
                }
                else
                {
                    userRating = new UserRatingMedia
                    {
                        UserThatRateId = userId,
                        Rating = rating,
                        IdTableMedia = mediaInfo!.IdTableMedia
                    };
                    _context.UserRatingMedia.Add(userRating);
                }

                await _context.SaveChangesAsync();
                return true;
            }
            catch (Exception ex)
            {
                Console.Error.WriteLine(ex.Message);
                return false;
            }
        }

        public async Task<List<RatingPercentageDto>> GetRatesForMedia(int mediaId)
        {
            var ratesForMedia = await _context.UserRatingMedia
                .Include(urm => urm.MediaInfo)
                .Where(urm => urm.MediaInfo.IdMedia == mediaId)
                .ToListAsync();

            var totalChoices = ratesForMedia.Count;

            if (totalChoices == 0)
            {
                return [];
            }

            var ratePercentages = ratesForMedia
                .GroupBy(urm => urm.Rating)
                .Select(group => new RatingPercentageDto
                {
                    Rating = group.Key,
                    Percentage = (double)group.Count() / totalChoices * 100
                })
                .ToList();

            return ratePercentages;
        }

        public async Task<int> GetUserRate(string userId, int mediaId)
        {
            var userRating = await UserAlreadyGiveRating(userId, mediaId);
            if (userRating != null)
            {
                return userRating.Rating;
            }
            return 0;
        }

        public async Task<double> GetAverageRatingForMedia(int mediaId)
        {
            var ratesForMedia = await _context.UserRatingMedia
                .Include(urm => urm.MediaInfo)
                .Where(urm => urm.MediaInfo.IdMedia == mediaId)
                .ToListAsync();

            var totalRatings = ratesForMedia.Count;

            if (totalRatings == 0)
            {
                return 0;
            }

            var sumRatings = ratesForMedia.Sum(urm => urm.Rating); // Substitua 'Rating' pelo nome da sua propriedade de rating
            var averageRating = sumRatings / (double)totalRatings;

            return averageRating;
        }

        private async Task<UserRatingMedia?> UserAlreadyGiveRating(string userId, int mediaId)
        {
            var userRatingMedia = await _context.UserRatingMedia
                    .FirstOrDefaultAsync(urm => urm.UserThatRateId == userId && urm.MediaInfo.IdMedia == mediaId);
            return userRatingMedia;
        }

        private async Task<bool> MediaAlreadyOnDatabase(int mediaId)
        {
            var media = await _context.MediaInfoModel.Where(m => m.IdMedia == mediaId).FirstOrDefaultAsync();
            if (media != null) return true;
            return false;
        }

        private async Task<bool> AddMediaToDatabase(UserMediaDto media)
        {
            if (media == null) return false;
            try
            {
                _context.MediaInfoModel.Add(new Models.Media.MediaInfoModel
                {
                    IdMedia = media.MediaId,
                    Type = media.Type,
                });
                await _context.SaveChangesAsync();
                return true;
            }
            catch (Exception ex)
            {
                Console.Error.WriteLine(ex.Message);
                return false;
            }
        }

    }

}
