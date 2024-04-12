namespace WatchersWorld.Server.DTOs.Chat
{
    /// <summary>
    /// DTO (Data Transfer Object) utilizado para representar um chat, incluindo informações do usuário e uma lista de mensagens.
    /// </summary>
    public class ChatWithMessagesDto
    {
        /// <summary>
        /// Nome de utilizador do proprietário do chat.
        /// </summary>
        public string Username { get; set; }

        /// <summary>
        /// URL para a fotografia de perfil do utilizador.
        /// </summary>
        public string ProfilePhoto { get; set; }

        /// <summary>
        /// Lista das mensagens trocadas no chat. Cada mensagem é representada como um objeto de tipo MessageDto.
        /// </summary>
        public List<MessageDto> Messages { get; set; }
    }
}
