namespace WatchersWorld.Server.DTOs.Account
{
    /// <summary>
    /// DTO utilizado para enviar email.
    /// Contém o destinatário, o assunto e o corpo do email.
    /// </summary>
    /// <remarks>
    /// Inicializa uma nova instância de EmailSendDto.
    /// </remarks>
    /// <param name="to">Endereço de email do destinatário.</param>
    /// <param name="subject">Assunto do email.</param>
    /// <param name="body">Conteúdo do corpo do email.</param>
    public class EmailSendDto(string to, string subject, string body)
    {

        /// <summary>
        /// Endereço de email do destinatário.
        /// </summary>
        public string To { get; set; } = to;

        /// <summary>
        /// Assunto do email.
        /// </summary>
        public string Subject { get; set; } = subject;

        /// <summary>
        /// Conteúdo do corpo do email.
        /// </summary>
        public string Body { get; set; } = body;
    }
}
