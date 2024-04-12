namespace WatchersWorld.Server.DTOs.Media
{
    /// <summary>
    /// Representa um Objeto de Transferência de Dados (DTO) para contagem do número de mídias adicionadas por data.
    /// </summary>  
    public class MediaAddedByDateDto
    {

        /// <summary>
        /// Obtém ou define a data associada à contagem de mídias adicionadas.
        /// </summary>
        public DateTime Date { get; set; }

        /// <summary>
        /// Obtém ou define o número de mídias adicionadas para a data especificada.
        /// </summary>
        public int Count { get; set; }
    }
}
