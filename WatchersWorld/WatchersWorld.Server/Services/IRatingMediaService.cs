using Microsoft.EntityFrameworkCore;
using WatchersWorld.Server.Data;
using WatchersWorld.Server.DTOs.Media;
using WatchersWorld.Server.Models.Media.FavoriteActor;
using WatchersWorld.Server.Models.Media.RatingMedia;
#nullable enable

namespace WatchersWorld.Server.Services
{
    /// <summary>
    /// Interface que define operações para a gestão de avaliações de Media.
    /// </summary>
    public interface IRatingMediaService
    {
        /// <summary>
        /// Atribui uma avaliação a uma Media específica por um utilizador.
        /// </summary>
        /// <param name="userId">O identificador do utilizador que realiza a avaliação.</param>
        /// <param name="media">O DTO da Media que contém informações sobre a Media.</param>
        /// <param name="rating">O valor da avaliação (entre 1 e 5).</param>
        /// <returns>Uma tarefa que representa a operação assíncrona. O resultado da tarefa contém um booleano que indica o sucesso da operação.</returns>
        Task<bool> GiveRatingToMedia(string userId, UserMediaDto media, int rating);

        /// <summary>
        /// Recupera a distribuição das avaliações para uma Media específica.
        /// </summary>
        /// <param name="mediaId">O identificador da Media.</param>
        /// <returns>Uma tarefa que representa a operação assíncrona. O resultado da tarefa contém uma lista de percentagens de avaliações.</returns>
        Task<List<RatingPercentageDto>> GetRatesForMedia(int mediaId);

        /// <summary>
        /// Obtém a avaliação específica dada por um utilizador a uma Media.
        /// </summary>
        /// <param name="userId">O identificador do utilizador.</param>
        /// <param name="mediaId">O identificador da Media.</param>
        /// <returns>Uma tarefa que representa a operação assíncrona. O resultado da tarefa contém o valor da avaliação ou 0 se não houver avaliação.</returns>
        Task<int> GetUserRate(string userId, int mediaId);

        /// <summary>
        /// Calcula a avaliação média para uma Media específica.
        /// </summary>
        /// <param name="mediaId">O identificador da Media.</param>
        /// <returns>Uma tarefa que representa a operação assíncrona. O resultado da tarefa contém a avaliação média como um double.</returns>
        Task<double> GetAverageRatingForMedia(int mediaId);
    }

    /// <summary>
    /// Serviço para a gestão de avaliações de Media.
    /// </summary>
    /// <remarks>
    /// Inicializa uma nova instância da classe <see cref="RatingMediaService"/>.
    /// </remarks>
    /// <param name="context">O contexto da base de dados.</param>
    public class RatingMediaService(WatchersWorldServerContext context) : IRatingMediaService 
    {

        public WatchersWorldServerContext Context { get; set; } = context;

        /// <inheritdoc />
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
                var mediaInfo = await Context.MediaInfoModel.Where(m => m.IdMedia == media.MediaId).FirstOrDefaultAsync();

                if (userRating != null)
                {
                    userRating.Rating = rating;
                    Context.UserRatingMedia.Update(userRating);
                }
                else
                {
                    userRating = new UserRatingMedia
                    {
                        UserThatRateId = userId,
                        Rating = rating,
                        IdTableMedia = mediaInfo!.IdTableMedia
                    };
                    Context.UserRatingMedia.Add(userRating);
                }

                await Context.SaveChangesAsync();
                return true;
            }
            catch (Exception ex)
            {
                Console.Error.WriteLine(ex.Message);
                return false;
            }
        }

        /// <inheritdoc />
        public async Task<List<RatingPercentageDto>> GetRatesForMedia(int mediaId)
        {
            var ratesForMedia = await Context.UserRatingMedia
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

        /// <inheritdoc />
        public async Task<int> GetUserRate(string userId, int mediaId)
        {
            var userRating = await UserAlreadyGiveRating(userId, mediaId);
            if (userRating != null)
            {
                return userRating.Rating;
            }
            return 0;
        }

        /// <inheritdoc />
        public async Task<double> GetAverageRatingForMedia(int mediaId)
        {
            var ratesForMedia = await Context.UserRatingMedia
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

        /// <summary>
        /// Verifica se um utilizador já avaliou uma determinada Media.
        /// </summary>
        /// <param name="userId">Identificador único do utilizador.</param>
        /// <param name="mediaId">Identificador único da Media.</param>
        /// <returns>
        /// Retorna uma instância de <see cref="UserRatingMedia"/> caso o utilizador já tenha avaliado a Media;
        /// caso contrário, retorna null.
        /// </returns>
        private async Task<UserRatingMedia?> UserAlreadyGiveRating(string userId, int mediaId)
        {
            var userRatingMedia = await Context.UserRatingMedia
                    .FirstOrDefaultAsync(urm => urm.UserThatRateId == userId && urm.MediaInfo.IdMedia == mediaId);
            return userRatingMedia;
        }

        /// <summary>
        /// Verifica se uma Media já existe na base de dados.
        /// </summary>
        /// <param name="mediaId">Identificador único da Media.</param>
        /// <returns>
        /// Retorna true se a Media já existir na base de dados; caso contrário, retorna false.
        /// </returns>
        private async Task<bool> MediaAlreadyOnDatabase(int mediaId)
        {
            var media = await Context.MediaInfoModel.Where(m => m.IdMedia == mediaId).FirstOrDefaultAsync();
            if (media != null) return true;
            return false;
        }

        /// <summary>
        /// Adiciona uma nova Media à base de dados.
        /// </summary>
        /// <param name="media">Dados da Media a ser adicionada.</param>
        /// <returns>
        /// Retorna true se a Media for adicionada com sucesso à base de dados; caso contrário, retorna false.
        /// Esta operação pode falhar devido a problemas como violações de restrições da base de dados ou erros de comunicação.
        /// </returns>
        private async Task<bool> AddMediaToDatabase(UserMediaDto media)
        {
            if (media == null) return false;
            try
            {
                Context.MediaInfoModel.Add(new Models.Media.MediaInfoModel
                {
                    IdMedia = media.MediaId,
                    Type = media.Type,
                });
                await Context.SaveChangesAsync();
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
