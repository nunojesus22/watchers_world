using Microsoft.AspNetCore.Identity;
using Microsoft.EntityFrameworkCore;
using WatchersWorld.Server.Data;
using WatchersWorld.Server.DTOs;
using WatchersWorld.Server.DTOs.Media;
using WatchersWorld.Server.Models.Authentication;
using WatchersWorld.Server.Models.Media.FavoriteActor;
#nullable enable

namespace WatchersWorld.Server.Services
{


    public interface IFavoriteActorService
    {
        Task<bool> ChooseAnActor(string userId, int actorId, UserMediaDto media, List<ActorDto> actors);
        Task<List<ActorVotePercentageDto>> GetChoicesForMedia(int mediaId);
        Task<int> GetUserChoice(string userId, int mediaId);
    }

    public class FavoriteActorService : IFavoriteActorService
    {
        public WatchersWorldServerContext _context {  get; set; }

        public FavoriteActorService(WatchersWorldServerContext context) 
        {
            _context = context;
        }

        public async Task<bool> ChooseAnActor(string userId, int actorId, UserMediaDto media, List<ActorDto> actors)
        {
            if (!await MediaAlreadyOnDatabase(media.MediaId))
            {
                var result = await AddMediaToDatabase(media);
                if(!result) return false;
            }

            var existingActorIds = await ActorsAlreadyOnDatabase(actors);

            var newActors = actors.Where(a => !existingActorIds.Contains(a.ActorId)).ToList();
            foreach (var newActor in newActors)
            {
                var result = await AddActorToDatabase(newActor);
                if (!result) return false;
            }

            var connectActorsToMedia = await EnsureActorMediaRelations(actors, media.MediaId);
            if(!connectActorsToMedia) return false;

            try
            {
                var actorMediaEntry = await _context.ActorMedia
                    .FirstOrDefaultAsync(am => am.MediaInfo.IdMedia == media.MediaId && am.ActorId == actorId);

                var favoriteActorChoice = await UserAlreadyChoose(userId, media.MediaId);

                if (favoriteActorChoice != null)
                {
                    favoriteActorChoice.ActorMediaId = actorMediaEntry!.Id;
                    _context.FavoriteActorChoice.Update(favoriteActorChoice);
                }
                else
                {
                    favoriteActorChoice = new FavoriteActorChoice
                    {
                        UserThatChooseId = userId,
                        ActorMediaId = actorMediaEntry!.Id,
                    };
                    _context.FavoriteActorChoice.Add(favoriteActorChoice);
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

        public async Task<List<ActorVotePercentageDto>> GetChoicesForMedia(int mediaId)
        {
            var choicesForMedia = await _context.FavoriteActorChoice
                .Include(fac => fac.ActorMedia)
                .Where(fac => fac.ActorMedia.MediaInfo.IdMedia == mediaId)
                .ToListAsync();

            var totalChoices = choicesForMedia.Count;

            if (totalChoices == 0)
            {
                return [];
            }

            var votePercentages = choicesForMedia
                .GroupBy(fac => fac.ActorMedia.ActorId)
                .Select(group => new ActorVotePercentageDto
                {
                    ActorId = group.Key,
                    Percentage = (double)group.Count() / totalChoices * 100
                })
                .ToList();

            return votePercentages;
        }

        public async Task<int> GetUserChoice(string userId, int mediaId)
        {
            var favoriteActorChoice = await UserAlreadyChoose(userId, mediaId);
            if (favoriteActorChoice != null)
            {
                return await _context.ActorMedia.Where(am => am.Id == favoriteActorChoice.ActorMediaId).Select(am => am.ActorId).SingleAsync();
            }
            return 0;
        }

        private async Task<bool> EnsureActorMediaRelations(List<ActorDto> actors, int mediaId)
        {
            var existingActorMediaRelations = await _context.ActorMedia
                .Where(am => am.MediaInfo.IdMedia == mediaId && actors.Select(a => a.ActorId).Contains(am.ActorId))
                .Select(am => am.ActorId)
                .ToListAsync();

            var actorsToAdd = actors.Where(a => !existingActorMediaRelations.Contains(a.ActorId)).ToList();
            var idTableMedia = await _context.MediaInfoModel.Where(m => m.IdMedia == mediaId).Select(m => m.IdTableMedia).SingleAsync();

            foreach (var actor in actorsToAdd)
            {
                var actorMedia = new ActorMedia { ActorId = actor.ActorId, IdTableMedia = idTableMedia};
                try
                {
                    _context.ActorMedia.Add(actorMedia);
                }
                catch (Exception ex)
                {
                    Console.Error.WriteLine(ex.Message);
                    return false;
                }
            }

            if (actorsToAdd.Count != 0)
            {
                try
                {
                    await _context.SaveChangesAsync();
                    return true;
                }
                catch (Exception ex)
                {
                    Console.Error.WriteLine(ex.Message);
                    return false;
                }
                
            }
            return true;
        }

            private async Task<List<int>> ActorsAlreadyOnDatabase(List<ActorDto> actors)
        {
            var existingActorIds = await _context.Actor
                .Where(a => actors.Select(dto => dto.ActorId).Contains(a.ActorId))
                .Select(a => a.ActorId)
                .ToListAsync();
            return existingActorIds;
        }


        private async Task<FavoriteActorChoice?> UserAlreadyChoose(string userId, int mediaId)
        {
            var favoriteActorChoice = await _context.FavoriteActorChoice
                    .FirstOrDefaultAsync(fac => fac.UserThatChooseId == userId && fac.ActorMedia.MediaInfo.IdMedia == mediaId);
            return favoriteActorChoice;
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

        private async Task<bool> AddActorToDatabase(ActorDto actor)
        {
            if (actor == null) return false;
            try
            {
                _context.Actor.Add(new Actor
                {
                    ActorId = actor.ActorId,
                    ActorName = actor.ActorName,
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
