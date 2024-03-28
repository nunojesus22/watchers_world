using WatchersWorld.Server.DTOs.Account;

namespace WatchersWorld.Server.Chat.DTOs
{
    public class ChatWithMessagesDto
    {
        public string Username { get; set; }
        public string ProfilePhoto { get; set; }
        public List<MessageDto> Messages { get; set; }
    }
}
