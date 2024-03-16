namespace WatchersWorld.Server.DTOs.Media
{
    public class CreateCommentDto
    {
        public int MediaId { get; set; }
        public string Text { get; set; }
        public int? ParentCommentId { get; set; } // Adicione isto para suportar respostas

        public List<CommentDto> Replies { get; set; } = new List<CommentDto>(); // Adicione isto para incluir respostas

    }
}
