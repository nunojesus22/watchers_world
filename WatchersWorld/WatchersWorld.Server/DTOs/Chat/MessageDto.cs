namespace WatchersWorld.Server.DTOs.Chat
{
    /// <summary>
    /// DTO (Data Transfer Object) utilizado para representar as informações de uma mensagem individual dentro de um chat.
    /// </summary>
    public class MessageDto
    {
        /// <summary>
        /// Identificador único da mensagem.
        /// </summary>
        public string MessageId { get; set; }

        /// <summary>
        /// Nome de utilizador do remetente da mensagem.
        /// </summary>
        public string SendUsername { get; set; }

        /// <summary>
        /// Texto da mensagem enviada.
        /// </summary>
        public string Text { get; set; }

        /// <summary>
        /// Data e hora em que a mensagem foi enviada. É opcional e pode ser nulo se a mensagem ainda não tiver sido enviada.
        /// </summary>
        public DateTime? SentAt { get; set; }

        /// <summary>
        /// Data e hora em que a mensagem foi lida pelo destinatário. É opcional e pode ser nulo se a mensagem ainda não tiver sido lida.
        /// </summary>
        public DateTime? ReadAt { get; set; }
    }
}
