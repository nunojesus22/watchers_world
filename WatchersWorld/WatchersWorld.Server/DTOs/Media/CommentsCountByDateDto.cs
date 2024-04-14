namespace WatchersWorld.Server.DTOs.Media
{
    /// <summary>
    /// Representa um Objeto de Transferência de Dados (DTO) para contagem do número de comentários por data.
    /// </summary>
    public class CommentsCountByDateDto
    {
        /// <summary>
        /// Obtém ou define a data associada ao número de comentários.
        /// </summary>
        public DateTime Date { get; set; }

        /// <summary>
        /// Obtém ou define o número de comentários para a data especificada.
        /// </summary>
        public int Count { get; set; }
    }

}
