import { HttpClient, HttpHeaders } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { Register } from '../models/register';
import { environment } from '../../../environments/environment.development';
import { Login } from '../models/login';
import { User } from '../models/user';
import { ReplaySubject, map, of } from 'rxjs';
import { Router } from '@angular/router';
import { ConfirmEmail } from '../models/confirmEmail';
import { ResetPassword } from '../models/resetPassword';
import { LoginWithExternal } from '../models/loginWithExternals';
import { RegisterWithExternal } from '../models/registerWithExternal';
import { ChatService } from '../../chat/services/chat.service';

/**
 * Serviço de autenticação responsável pelo gerenciamento de operações relacionadas à autenticação de utilizadores,
 * como login, registro, confirmação de email, redefinição de senha, e mais.
 *
 * @class AuthenticationService
 */
@Injectable({
  providedIn: 'root'
})
export class AuthenticationService {
  private userSource = new ReplaySubject<User | null>(1); //apenas um user dentro do user source
  user$ = this.userSource.asObservable();

  constructor(private http: HttpClient, private router : Router) { }

  /**
   * Recupera o nome de utilizador do utilizador autenticado atualmente.
   *
   * @returns O nome de utilizador ou null se nenhum utilizador estiver autenticado.
   */
  getLoggedInUserName(): string | null {
    const user = this.getStoredUser();
    return user ? user.username : null;
  }

  /**
   * Busca o utilizador armazenado localmente (por exemplo, em localStorage).
   *
   * @returns O utilizador recuperado ou null se nenhum utilizador estiver armazenado.
   */
  private getStoredUser(): User | null {
    const key = localStorage.getItem(environment.userKey);
    return key ? JSON.parse(key) : null;
  }

  /**
   * Recupera o(s) papel(is) de um utilizador específico.
   *
   * @param username O nome de utilizador para consulta.
   * @returns Observable contendo a lista de papéis do utilizador.
   */
  getUserRole(username: string) {
    return this.http.get<string[]>(`${environment.appUrl}/api/account/getUserRole/${username}`);
  }

  /**
   * Atualiza o utilizador autenticado com base em um token JWT.
   *
   * @param jwt O JWT a ser utilizado para a atualização do utilizador.
   * @returns Observable da operação de atualização.
   */
  refreshUser(jwt: string | null) {
    if (jwt === null) {
      this.userSource.next(null);
      return of(undefined);
    }

    let headers = new HttpHeaders();
    headers = headers.set("Authorization", "Bearer " + jwt);

    return this.http.get<User>(`${environment.appUrl}/api/account/refresh-user-token`, { headers }).pipe(
      map((user: User) => {
        if (user) {
          this.setUser(user);
        }
      })
    );
  }

  /**
   * Registra um novo utilizador no sistema.
   *
   * @param model Os dados de registro do utilizador.
   * @returns Observable da operação de registro.
   */
  register(model: Register) {
    console.log(environment.appUrl);
    return this.http.post(`${environment.appUrl}/api/account/register`, model);
  }

  /**
   * Confirma o email de um utilizador utilizando um token de confirmação.
   *
   * @param model Os dados necessários para a confirmação do email.
   * @returns Observable da operação de confirmação.
   */
  confirmEmail(model: ConfirmEmail) {
    return this.http.put(`${environment.appUrl}/api/account/confirm-email`, model);
  }

  /**
   * Reenvia o link de confirmação de email para um utilizador.
   *
   * @param email O email do utilizador que requer reenvio do link.
   * @returns Observable da operação de reenvio.
   */
  resendEmailConfirmationLink(email: string) {
    return this.http.post(`${environment.appUrl}/api/account/resend-email-confirmation-link/${email}`, {});
  }

  /**
   * Solicita a redefinição de senha para um utilizador com base no seu email.
   *
   * @param email O email do utilizador que deseja redefinir sua senha.
   * @returns Observable da operação de solicitação de redefinição de senha.
   */
  forgotPassword(email: string) {
    return this.http.post(`${environment.appUrl}/api/account/forgot-password/${email}`, {});
  }

  /**
   * Realiza a redefinição de senha de um utilizador utilizando o modelo de dados necessário.
   *
   * @param model Os dados necessários para a redefinição de senha.
   * @returns Observable da operação de redefinição.
   */
  resetPassword(model: ResetPassword) {
    return this.http.put(`${environment.appUrl}/api/account/reset-password`, model);
  }

  /**
   * Realiza o login de um utilizador no sistema utilizando as credenciais fornecidas.
   * Este método também trata a verificação de confirmação da conta e atualiza o estado do utilizador no sistema.
   *
   * @param model Os dados necessários para o login, incluindo email e senha.
   * @returns Retorna um observable que emite o resultado da operação de login, contendo o utilizador autenticado e mensagens relevantes.
   */
  login(model: Login) {
    return this.http.post<User>(`${environment.appUrl}/api/account/login`, model).pipe(
      map((response: any) => {
        var user: User | undefined;
        var message = response.message;

        if (response.message === "A conta está por confirmar!") {
          return message;
        }

        if (response && response.user.email && response.user.jwt && response.user.username) {
          user = new User(response.user.email, response.user.jwt, response.user.username);
          this.setUser(user);
        }
        
        return { user, message };
      }),
    );
  }

  /**
 * Registra um utilizador no sistema utilizando credenciais de um provedor externo como Google, Facebook, etc.
 * Após o registro bem-sucedido, as informações do utilizador são salvas e seu estado é atualizado no sistema.
 *
 * @param model Os dados recebidos do provedor externo necessários para o registro.
 * @returns Retorna um observable que processa a resposta do servidor e atualiza o estado do utilizador.
 */
  registerWithThirdParty(model: RegisterWithExternal) {
    return this.http.post<User>(`${environment.appUrl}/api/account/register-with-third-party`, model)
      .pipe(
        map((user: User) => {
          if (user) {
            this.setUser(user);
          }
        })
      );
  }

  /**
 * Realiza o login de um utilizador utilizando credenciais de um provedor externo.
 * Semelhante ao registro, após um login bem-sucedido, as informações do utilizador são salvas e seu estado é atualizado.
 *
 * @param model Os dados recebidos do provedor externo para autenticação.
 * @returns Retorna um observable que processa a resposta do servidor e atualiza o estado do utilizador, caso o login seja bem-sucedido.
 */
  loginWithThirdParty(model: LoginWithExternal) {
    return this.http.post<User>(`${environment.appUrl}/api/account/login-with-third-party`, model)
      .pipe(
        map((user: User) => {
          if (user) {
            this.setUser(user);
          }
        })
      );
  }

  /**
   * Realiza o logout do utilizador, removendo suas informações de autenticação do local storage e atualizando o estado no serviço.
   */
  logout() {
    localStorage.removeItem(environment.userKey);
    this.userSource.next(null);
    this.router.navigateByUrl("/home");
  }

  /**
   * Recupera o JWT do utilizador autenticado a partir do local storage.
   *
   * @returns O JWT se disponível, ou null caso contrário.
   */
  getJWT() {
    const key = localStorage.getItem(environment.userKey);
    if (key) {
      const user: User = JSON.parse(key);
      return user.jwt;
    } else {
      return null;
    }
  }

  /**
   * Atualiza as informações locais do utilizador autenticado e notifica os observadores com o novo estado do utilizador.
   *
   * @param user O utilizador cujas informações foram atualizadas.
   */
  private setUser(user: User) {
    localStorage.setItem(environment.userKey, JSON.stringify(user));
    this.userSource.next(user);
  }
}
