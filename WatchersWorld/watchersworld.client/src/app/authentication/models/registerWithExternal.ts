/**
 * Classe para armazenar informações de registro de utilizador utilizando serviços de autenticação externos.
 * Contém detalhes recebidos de provedores de identidade externos como Google, Facebook, etc.
 *
 * @class RegisterWithExternal
 */
export class RegisterWithExternal {
  userName: string;
  userId: string;
  accessToken: string;
  provider: string;
  email: string;

  /**
   * Construtor para inicializar um objeto RegisterWithExternal com os dados fornecidos pelo provedor externo.
   * 
   * @param userName O nome de utilizador associado à conta externa.
   * @param userId O identificador único do utilizador no serviço externo.
   * @param accessToken O token de acesso fornecido pelo serviço externo para acessar a API do provedor.
   * @param provider O nome do serviço provedor de identidade externo (ex.: Google, Facebook).
   * @param email O endereço de email do utilizador conforme fornecido pelo serviço externo.
   */
  constructor(userName: string, userId: string, accessToken: string, provider: string, email:string)
 {
    this.userName = userName;
    this.userId = userId;
    this.accessToken = accessToken;
    this.provider = provider;
    this.email = email;
  }
}
