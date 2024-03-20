namespace WatchersWorld.Server.DTOs
{
    /// <summary>
    /// DTO utilizado para representar a percentagem de votos atribuídos a um ator, incluindo o identificador do ator e a percentagem de votos.
    /// </summary>
    public class ActorVotePercentageDto
    {
        /// <summary>
        /// Identificador do ator.
        /// </summary>
        public int ActorId { get; set; }

        /// <summary>
        /// Percentagem de votos atribuídos ao ator.
        /// </summary>
        public double Percentage { get; set; }
    }
}
