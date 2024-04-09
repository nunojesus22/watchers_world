/**
 * Modelo para representar uma associação de mídia a um utilizador.
 * Inclui informações sobre a mídia associada a um perfil de utilizador, como filmes ou séries favoritas.
 * 
 * Propriedades:
 * - mediaId: Identificador único da mídia.
 * - type: Tipo de mídia, como "filme", "série", etc.
 */
export interface UserMedia {
  mediaId: number;
  type: string;
}
