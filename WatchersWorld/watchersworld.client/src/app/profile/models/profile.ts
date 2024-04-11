/**
 * Modelo para representar o perfil de um utilizador na aplicação.
 * Este modelo inclui informações pessoais e de configuração do perfil de um utilizador na plataforma.
 * 
 * Propriedades:
 * - userName: Nome de utilizador único na plataforma.
 * - birthDate: Data de nascimento do utilizador.
 * - description: Descrição ou biografia fornecida pelo utilizador. Pode ser nula.
 * - gender: Género do utilizador. Pode ser nulo se o utilizador escolher não especificar.
 * - profilePhoto: Caminho ou URL para a foto de perfil do utilizador.
 * - coverPhoto: Caminho ou URL para a foto de capa do perfil do utilizador.
 * - profileStatus: Estado do perfil do utilizador, podendo indicar visibilidade como "público" ou "privado".
 * - followers: Número de seguidores que o utilizador possui.
 * - following: Número de utilizadores que este utilizador está a seguir.
 * - startBanDate: Data de início do banimento do utilizador, se aplicável.
 * - endBanDate: Data de fim do banimento do utilizador, se aplicável.
 * - isBanned: Indica se o utilizador está atualmente banido.
 * - isModerator: Indica se o utilizador tem privilégios de moderador.
 */
export class Profile {
  userName!: string;
  birthDate: Date;
  description: string | null;
  gender: string | null;
  profilePhoto: string;
  coverPhoto: string;
  profileStatus: string;
  followers: number;
  following: number
  startBanDate: Date | undefined;
  endBanDate: Date | undefined;
  isBanned: boolean | undefined;
  isModerator: boolean | undefined;

  constructor(
    birthDate: Date,
    description: string | null,
    gender: string | null,
    profilePhoto: string,
    coverPhoto: string,
    profileStatus: string,
    followers: number,
    following: number,
  ) {
    this.birthDate = birthDate;
    this.description = description;
    this.gender = gender;
    this.profilePhoto = profilePhoto;
    this.coverPhoto = coverPhoto;
    this.profileStatus = profileStatus;
    this.followers = followers;
    this.following = following;
  }
}
