/**
 * Classe para representar um utilizador no sistema.
 * Armazena as informações essenciais do utilizador que são frequentemente utilizadas após o login.
 *
 * @class User
 */
export class User {
  /**
   * Construtor da classe User.
   *
   * @param email O endereço de email do utilizador.
   * @param jwt O token JWT (JSON Web Token) usado para autenticação nas requisições API.
   * @param username O nome de utilizador único.
   */
  constructor(
    public email: string,    
    public jwt: string,     
    public username: string 
  ) { }
}
