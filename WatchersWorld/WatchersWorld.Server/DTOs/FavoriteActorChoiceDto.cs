using WatchersWorld.Server.DTOs.Media;

namespace WatchersWorld.Server.DTOs
{
    public class FavoriteActorChoiceDto
    {
        public UserMediaDto Media { get; set; }
        public int ActorChoiceId { get; set; }
        public List<ActorDto> MediaCast {  get; set; }
        public string Username { get; set; }
    }
}
