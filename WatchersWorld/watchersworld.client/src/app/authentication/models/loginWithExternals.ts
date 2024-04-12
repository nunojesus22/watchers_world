/**
 * Classe para armazenar informações necessárias para autenticar um utilizador utilizando credenciais de provedores externos.
 *
 * @class LoginWithExternal
 */
export class LoginWithExternal {
  
  accessToken: string;
  userId: string;
  provider: string;
  email: string;

  /**
   * Construtor para inicializar um objeto LoginWithExternal com dados de autenticação externa.
   * 
   * @param accessToken O token de acesso fornecido pelo serviço externo.
   * @param userId O identificador único do utilizador no serviço externo.
   * @param provider O nome do serviço provedor de identidade externo (ex.: Google, Facebook).
   * @param email O endereço de email associado à conta do utilizador no serviço externo.
   */
  constructor(accessToken: string, userId: string, provider: string, email: string)//
 {
    this.accessToken = accessToken;
    this.userId = userId;
    this.provider = provider;
    this.email = email;
  }
}
