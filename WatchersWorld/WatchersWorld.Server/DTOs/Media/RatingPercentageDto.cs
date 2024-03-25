namespace WatchersWorld.Server.DTOs.Media
{
    /// <summary>
    /// DTO que representa a percentagem de avaliações para uma determinada classificação.
    /// Inclui a classificação específica e a sua percentagem correspondente.
    /// </summary>
    public class RatingPercentageDto
    {
        /// <summary>
        /// Classificação específica.
        /// </summary>
        public int Rating { get; set; }

        /// <summary>
        /// Percentagem da classificação específica.
        /// </summary>Ra
        public double Percentage { get; set; }
    }
}
