namespace WatchersWorld.Server.Chat.DTOs
{
    public class MessageDto
    {
        public string MessageId { get; set; }
        public string SendUsername { get; set; }
        public string Text { get; set; }
        public DateTime? SentAt { get; set; }
        public DateTime? ReadAt { get; set; }
    }
}
