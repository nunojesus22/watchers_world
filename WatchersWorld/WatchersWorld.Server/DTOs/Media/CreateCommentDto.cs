namespace WatchersWorld.Server.DTOs.Media
{
    /// <summary>
    /// DTO (Data Transfer Object) que representa os dados necessários para criar um novo comentário.
    /// </summary>
    public class CreateCommentDto
    {
        /// <summary>
        /// O ID da mídia à qual o comentário será associado.
        /// </summary>
        public int MediaId { get; set; }

        /// <summary>
        /// O texto do comentário.
        /// </summary>
        public string Text { get; set; }

        /// <summary>
        /// O ID do comentário pai, se este comentário for uma resposta a outro comentário.
        /// </summary>
        public int? ParentCommentId { get; set; } // Adicione isto para suportar respostas


        /// <summary>
        /// As respostas a este comentário, se houverem.
        /// </summary>
        public List<CommentDto> Replies { get; set; } = new List<CommentDto>(); // Adicione isto para incluir respostas

    }
}
