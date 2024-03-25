using Mailjet.Client;
using Mailjet.Client.TransactionalEmails;
using WatchersWorld.Server.DTOs.Account;

namespace WatchersWorld.Server.Services
{
    /// <summary>
    /// Classe de serviço para o envio de e-mails.
    /// Esta classe é responsável por gerir as operações de e-mail utilizando a API do MailJet.
    /// </summary>
    /// <remarks>
    /// Inicializa uma nova instância da classe EmailService.
    /// </remarks>
    /// <param name="config">Objeto de configuração para aceder às definições da aplicação, especificamente para o envio de e-mails.</param>
    public class EmailService(IConfiguration config)
    {

        /// <summary>
        /// Envia um e-mail de forma assíncrona.
        /// </summary>
        /// <param name="emailSend">Objeto de transferência de dados contendo os detalhes do e-mail a ser enviado.</param>
        /// <returns>Uma Tarefa que representa a operação assíncrona, retornando um booleano indicando sucesso ou falha.</returns>
        public async Task<bool> SendEmailAsync(EmailSendDto emailSend)
        {
            MailjetClient client = new(config["MailJet:Apikey"], config["MailJet:SecretKey"]);
            var email = new TransactionalEmailBuilder()
                .WithFrom(new SendContact(config["Email:From"], config["Email:ApplicationName"]))
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
