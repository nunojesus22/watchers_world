using Microsoft.EntityFrameworkCore;
using WatchersWorld.Server.Data;
using WatchersWorld.Server.DTOs;
using WatchersWorld.Server.DTOs.Media;
using WatchersWorld.Server.Models.Media.FavoriteActor;
#nullable enable

namespace WatchersWorld.Server.Services
{
    /// <summary>
    /// Interface que define as operações para a gestão de atores favoritos.
    /// </summary>
    public interface IFavoriteActorService
    {
        /// <summary>
        /// Escolhe um ator como favorito para um determinado utilizador e mídia.
        /// </summary>
        /// <param name="userId">Identificador do utilizador.</param>
        /// <param name="actorId">Identificador do ator escolhido.</param>
        /// <param name="media">Dados da mídia associada.</param>
        /// <param name="actors">Lista de atores para potencial adição à base de dados.</param>
        /// <returns>Verdadeiro se a escolha for bem-sucedida, falso caso contrário.</returns>
        Task<bool> ChooseAnActor(string userId, int actorId, UserMediaDto media, List<ActorDto> actors);

        /// <summary>
        /// Obtém as percentagens de votos para atores numa determinada mídia.
        /// </summary>
        /// <param name="mediaId">Identificador da mídia.</param>
        /// <param name="type">Tipo de media (movie, serie)</param>
        /// <returns>Lista das percentagens de votos para cada ator.</returns>
        Task<List<ActorVotePercentageDto>> GetChoicesForMedia(int mediaId, string type);

        /// <summary>
        /// Obtém a escolha de ator favorito de um utilizador para uma mídia específica.
        /// </summary>
        /// <param name="userId">Identificador do utilizador.</param>
        /// <param name="mediaId">Identificador da mídia.</param>
        /// <param name="type">Tipo de media (movie, serie)</param>
        /// <returns>Identificador do ator escolhido, ou 0 se não houver escolha.</returns>
        Task<int> GetUserChoice(string userId, int mediaId, string type);

        Task<int> GetTotalFavoriteActorsByUser(string username);

    }

    /// <summary>
    /// Serviço para a gestão de atores favoritos.
    /// </summary>
    /// <remarks>
    /// Inicializa uma nova instância da classe <see cref="FavoriteActorService"/>.
    /// </remarks>
    /// <param name="context">Contexto da base de dados.</param>
    public class FavoriteActorService(WatchersWorldServerContext context) : IFavoriteActorService
    {
        public WatchersWorldServerContext Context { get; set; } = context;

        public async Task<int> GetTotalFavoriteActorsByUser(string userId)
        {
            var totalFavoriteActors = await Context.FavoriteActorChoice
                .Where(fac => fac.UserThatChooseId == userId)
                .CountAsync();

            return totalFavoriteActors;
        }

        /// <summary>
        /// Escolhe um ator como favorito para um dado utilizador e mídia.
        /// </summary>
        /// <param name="userId">Identificador do utilizador que faz a escolha.</param>
        /// <param name="actorId">Identificador do ator escolhido.</param>
        /// <param name="media">DTO da mídia associada à escolha.</param>
        /// <param name="actors">Lista de DTOs dos atores para potencial inclusão na base de dados.</param>
        /// <returns>Verdadeiro se a escolha for bem-sucedida, falso caso contrário.</returns>
        /// <remarks>
        /// Este método realiza várias validações e operações: verifica se a mídia já existe na base de dados,
        /// adiciona novos atores se necessário, e garante as relações entre atores e mídias antes de registrar a escolha do utilizador.
        /// </remarks>
        public async Task<bool> ChooseAnActor(string userId, int actorId, UserMediaDto media, List<ActorDto> actors)
        {
            if (!await MediaAlreadyOnDatabase(media.MediaId, media.Type))
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

            var connectActorsToMedia = await EnsureActorMediaRelations(actors, media.MediaId, media.Type);
            if(!connectActorsToMedia) return false;

            try
            {
                var actorMediaEntry = await Context.ActorMedia
                    .FirstOrDefaultAsync(am => am.MediaInfo.IdMedia == media.MediaId && am.MediaInfo.Type == media.Type && am.ActorId == actorId);

                var favoriteActorChoice = await UserAlreadyChoose(userId, media.MediaId, media.Type);

                if (favoriteActorChoice != null)
                {
                    favoriteActorChoice.ActorMediaId = actorMediaEntry!.Id;
                    Context.FavoriteActorChoice.Update(favoriteActorChoice);
                }
                else
                {
                    favoriteActorChoice = new FavoriteActorChoice
                    {
                        UserThatChooseId = userId,
                        ActorMediaId = actorMediaEntry!.Id,
                    };
                    Context.FavoriteActorChoice.Add(favoriteActorChoice);
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

        /// <summary>
        /// Obtém as percentagens de votos para os atores de uma determinada mídia.
        /// </summary>
        /// <param name="mediaId">Identificador da mídia.</param>
        /// <param name="type">Tipo de media (movie, serie)</param>
        /// <returns>Lista de DTOs com os identificadores dos atores e as suas respectivas percentagens de votos.</returns>
        /// <remarks>
        /// Calcula a percentagem de escolhas de cada ator como favorito para uma dada mídia, com base nas escolhas dos utilizadores.
        /// </remarks>
        public async Task<List<ActorVotePercentageDto>> GetChoicesForMedia(int mediaId, string type)
        {
            var choicesForMedia = await Context.FavoriteActorChoice
                .Include(fac => fac.ActorMedia)
                .Where(fac => fac.ActorMedia.MediaInfo.IdMedia == mediaId && fac.ActorMedia.MediaInfo.Type == type)
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
                    Percentage = Math.Round((double)group.Count() / totalChoices * 100, 2)
                })
                .ToList();


            return votePercentages;
        }

        /// <summary>
        /// Obtém a escolha de ator favorito feita por um utilizador para uma mídia específica.
        /// </summary>
        /// <param name="userId">Identificador do utilizador.</param>
        /// <param name="mediaId">Identificador da mídia.</param>
        /// <param name="type">Tipo de media (movie, serie)</param>
        /// <returns>Identificador do ator escolhido pelo utilizador, ou 0 se nenhuma escolha foi feita.</returns>
        /// <remarks>
        /// Verifica se o utilizador já fez uma escolha de ator favorito para a mídia especificada e retorna o identificador do ator escolhido.
        /// </remarks>
        public async Task<int> GetUserChoice(string userId, int mediaId, string type)
        {
            var favoriteActorChoice = await UserAlreadyChoose(userId, mediaId, type);
            if (favoriteActorChoice != null)
            {
                return await Context.ActorMedia.Where(am => am.Id == favoriteActorChoice.ActorMediaId).Select(am => am.ActorId).SingleAsync();
            }
            return 0;
        }

        /// <summary>
        /// Garante as relações entre atores e mídias na base de dados.
        /// </summary>
        /// <param name="actors">Lista de DTOs dos atores.</param>
        /// <param name="mediaId">Identificador da mídia.</param>
        /// <returns>Verdadeiro se as relações foram garantidas com sucesso, falso caso contrário.</returns>
        /// <remarks>
        /// Adiciona relações entre atores e mídias na base de dados para atores que ainda não estão relacionados com a mídia especificada.
        /// </remarks>
        private async Task<bool> EnsureActorMediaRelations(List<ActorDto> actors, int mediaId,string type)
        {
            var existingActorMediaRelations = await Context.ActorMedia
                .Where(am => am.MediaInfo.IdMedia == mediaId && am.MediaInfo.Type == type && actors.Select(a => a.ActorId).Contains(am.ActorId))
                .Select(am => am.ActorId)
                .ToListAsync();

            var actorsToAdd = actors.Where(a => !existingActorMediaRelations.Contains(a.ActorId)).ToList();
            var idTableMedia = await Context.MediaInfoModel.Where(m => m.IdMedia == mediaId && m.Type == type).Select(m => m.IdTableMedia).SingleAsync();

            foreach (var actor in actorsToAdd)
            {
                var actorMedia = new ActorMedia { ActorId = actor.ActorId, IdTableMedia = idTableMedia};
                try
                {
                    Context.ActorMedia.Add(actorMedia);
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
                    await Context.SaveChangesAsync();
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

        /// <summary>
        /// Verifica quais atores já existem na base de dados.
        /// </summary>
        /// <param name="actors">Lista de DTOs dos atores.</param>
        /// <returns>Lista dos identificadores dos atores que já existem na base de dados.</returns>
        /// <remarks>
        /// Consulta a base de dados para encontrar os atores fornecidos que já estão registrados.
        /// </remarks>
        private async Task<List<int>> ActorsAlreadyOnDatabase(List<ActorDto> actors)
        {
            var existingActorIds = await Context.Actor
                .Where(a => actors.Select(dto => dto.ActorId).Contains(a.ActorId))
                .Select(a => a.ActorId)
                .ToListAsync();
            return existingActorIds;
        }

        /// <summary>
        /// Verifica se um utilizador já escolheu um ator favorito para uma mídia específica.
        /// </summary>
        /// <param name="userId">Identificador do utilizador.</param>
        /// <param name="mediaId">Identificador da mídia.</param>
        /// <returns>O registo da escolha do utilizador, ou null se nenhuma escolha foi feita.</returns>
        /// <remarks>
        /// Consulta a base de dados para verificar se já existe uma escolha de ator favorito feita pelo utilizador para a mídia especificada.
        /// </remarks>
        private async Task<FavoriteActorChoice?> UserAlreadyChoose(string userId, int mediaId, string type)
        {
            var favoriteActorChoice = await Context.FavoriteActorChoice
                    .FirstOrDefaultAsync(fac => fac.UserThatChooseId == userId && fac.ActorMedia.MediaInfo.IdMedia == mediaId && fac.ActorMedia.MediaInfo.Type == type);
            return favoriteActorChoice;
        }

        /// <summary>
        /// Verifica se uma mídia já existe na base de dados.
        /// </summary>
        /// <param name="mediaId">Identificador da mídia.</param>
        /// <returns>Verdadeiro se a mídia já existe, falso caso contrário.</returns>
        /// <remarks>
        /// Consulta a base de dados para verificar a existência da mídia pelo seu identificador.
        /// </remarks>
        private async Task<bool> MediaAlreadyOnDatabase(int mediaId, string type)
        {
            var media = await Context.MediaInfoModel.Where(m => m.IdMedia == mediaId && m.Type == type).FirstOrDefaultAsync();
            if (media != null) return true;
            return false;
        }

        /// <summary>
        /// Adiciona uma mídia à base de dados.
        /// </summary>
        /// <param name="media">DTO da mídia a ser adicionada.</param>
        /// <returns>Verdadeiro se a mídia for adicionada com sucesso, falso caso contrário.</returns>
        /// <remarks>
        /// Regista uma nova mídia na base de dados com os dados fornecidos no DTO.
        /// </remarks>
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

        /// <summary>
        /// Adiciona um ator à base de dados.
        /// </summary>
        /// <param name="actor">DTO do ator a ser adicionado.</param>
        /// <returns>Verdadeiro se o ator for adicionado com sucesso, falso caso contrário.</returns>
        /// <remarks>
        /// Regista um novo ator na base de dados com os dados fornecidos no DTO.
        /// </remarks>
        private async Task<bool> AddActorToDatabase(ActorDto actor)
        {
            if (actor == null) return false;
            try
            {
                Context.Actor.Add(new Actor
                {
                    ActorId = actor.ActorId,
                    ActorName = actor.ActorName,
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
