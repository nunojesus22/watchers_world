/**
 * Modelo para representar o perfil de um seguidor ou utilizador seguido.
 * Utilizado para transferir informações básicas sobre relações de seguimento entre utilizadores.
 * 
 * Propriedades:
 * - username: Nome de utilizador do perfil.
 * - profilePhoto: Caminho ou URL para a foto de perfil do utilizador.
 */
export class FollowerProfile {
  username: string;
  profilePhoto: string;

  constructor(username: string, profilePhoto: string) {
    this.username = username;
    this.profilePhoto = profilePhoto;
  }
}
