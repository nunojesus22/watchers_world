using Mailjet.Client;
using Mailjet.Client.Resources;
using Mailjet.Client.TransactionalEmails;
using WatchersWorld.Server.DTOs.Account;

namespace WatchersWorld.Server.Services
{
    /// <summary>
    /// Service class for sending emails.
    /// This class is responsible for handling email operations using MailJet API.
    /// </summary>
    public class EmailService
    {
        private readonly IConfiguration _config;

        /// <summary>
        /// Initializes a new instance of the EmailService class.
        /// </summary>
        /// <param name="config">Configuration object to access application settings, specifically for email sending.</param>
        public EmailService(IConfiguration config) {
            _config = config;
        }

        /// <summary>
        /// Asynchronously sends an email.
        /// </summary>
        /// <param name="emailSend">Data transfer object containing the details of the email to be sent.</param>
        /// <returns>A Task that represents the asynchronous operation, returning a boolean indicating success or failure.</returns>
        public async Task<bool> SendEmailAsync(EmailSendDto emailSend)
        {
            MailjetClient client = new MailjetClient(_config["MailJet:Apikey"], _config["MailJet:SecretKey"]);
            var email = new TransactionalEmailBuilder()
                .WithFrom(new SendContact(_config["Email:From"], _config["Email:ApplicationName"]))
                .WithSubject(emailSend.Subject)
                .WithHtmlPart(emailSend.Body)
                .WithTo(new SendContact(emailSend.To))
                .Build();

            var response = await client.SendTransactionalEmailAsync(email);
            if(response.Messages != null)
            {
                if (response.Messages[0].Status == "success")
                {
                    return true;
                }
            }

            return false;
        }
    }
}
