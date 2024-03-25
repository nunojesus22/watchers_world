using System.ComponentModel.DataAnnotations;

namespace WatchersWorld.Server.DTOs.Media
{
    /// <summary>
    /// DTO (Objeto de Transferência de Dados) que representa um ator dentro do sistema.
    /// Contém o identificador único do ator e o seu nome. Este DTO pode ser usado para transportar dados de atores entre diferentes camadas da aplicação.
    /// </summary>
    public class ActorDto
    {
        /// <summary>
        /// Identificador único do ator. Este é um valor obrigatório que serve como a chave primária na base de dados.
        /// </summary>
        [Required]
        public int ActorId { get; set; }

        /// <summary>
        /// Nome do ator. Este campo é obrigatório e é usado para identificar o ator dentro da aplicação.
        /// </summary>
        [Required]
        public string ActorName { get; set; }
    }
}
