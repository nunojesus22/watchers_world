namespace WatchersWorld.Server.DTOs.Account
{
    /// <summary>
    /// Data Transfer Object (DTO) for sending email.
    /// Contains the necessary properties to construct an email message.
    /// </summary>
    public class EmailSendDto
    {
        /// <summary>
        /// Initializes a new instance of EmailSendDto.
        /// </summary>
        /// <param name="to">Recipient's email address.</param>
        /// <param name="subject">Subject of the email.</param>
        /// <param name="body">Body content of the email.</param>
        public EmailSendDto(string to, string subject, string body)
        {
            To = to;
            Subject = subject;
            Body = body;
        }

        /// <summary>
        /// Recipient's email address.
        /// </summary>
        public string To { get; set; }

        /// <summary>
        /// Subject of the email.
        /// </summary>
        public string Subject { get; set; }

        /// <summary>
        /// Body content of the email.
        /// </summary>
        public string Body { get; set; }
    }
}
