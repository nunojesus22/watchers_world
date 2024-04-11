/**
 * Interface que representa a estrutura de dados para uma medalha no contexto de gamificação.
 * Esta estrutura é utilizada para transferir informações sobre as medalhas entre o frontend e o backend,
 * permitindo a visualização e gestão das medalhas dentro do sistema.
 * 
 * Propriedades:
 * - id: Um identificador único para a medalha. É utilizado para referenciar a medalha de forma unívoca no sistema.
 * - name: O nome da medalha. Representa o título ou nome curto dado à medalha, que é exibido aos utilizadores.
 * - description: Uma descrição detalhada da medalha. Fornece aos utilizadores informações sobre como a medalha pode ser desbloqueada ou o seu significado.
 * - image: Um caminho ou URL para a imagem representativa da medalha. Utilizado para exibir uma representação visual da medalha nos interfaces de utilizador.
 */
export interface MedalsDto {
  id: number;
  name: string;
  description: string;
  image: string;
}
