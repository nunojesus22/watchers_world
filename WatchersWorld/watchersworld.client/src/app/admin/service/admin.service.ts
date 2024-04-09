import { HttpClient, HttpHeaders } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { Router } from '@angular/router';
import { Observable } from 'rxjs';
import { User } from '../../authentication/models/user';
import { environment } from '../../../environments/environment.development';
import { Profile } from '../../profile/models/profile';

/**
 * Este serviço é responsável pela gestão de operações administrativas,
 * incluindo a administração de utilizadores, a alteração de papéis de utilizadores,
 * e a recolha de estatísticas gerais sobre o sistema.
 */
@Injectable({
  providedIn: 'root'
})
export class AdminService {

  constructor(private http: HttpClient, private router: Router) { }

  /**
   * Recupera o token JWT do localStorage do navegador. Este token é utilizado para
   * autenticação nas requisições à API.
   * 
   * @returns O token JWT ou 'No JWT' se o token não estiver presente.
   */
  getJWT() {
    const key = localStorage.getItem(environment.userKey);
    if (key) {
      const user = JSON.parse(key) as User;
      return user.jwt;
    } else {
      return 'No JWT';
    }
  }

  /**
   * Constrói os cabeçalhos HTTP para inclusão do token JWT nas requisições à API.
   * 
   * @returns Um objeto HttpHeaders configurado com o tipo de conteúdo e o token JWT.
   */
  getHeaders() {
    const jwt = this.getJWT();

    // Set up the headers with the authentication token
    const headers = new HttpHeaders({
      'Content-Type': 'application/json',
      'Authorization': `Bearer ${jwt}`
    });

    return headers;
  }

  /**
  * Proíbe permanentemente um utilizador de aceder ao sistema.
  * 
  * @param username O nome de utilizador a ser banido permanentemente.
  * @returns Um Observable que emite o resultado da operação de proibição.
  */
  banUserPermanently(username: string): Observable<any> {
    const headers = this.getHeaders();
    return this.http.post<any>(`${environment.appUrl}/api/admin/ban-user-permanently/${encodeURIComponent(username)}`, {}, { headers });
  }

  /**
   * Proíbe temporariamente um utilizador de aceder ao sistema.
   * 
   * @param username O nome de utilizador a ser banido temporariamente.
   * @param banDurationInDays A duração da proibição em dias.
   * @returns Um Observable que emite o resultado da operação de proibição.
   */
  BanUserTemporarily(username: string, banDurationInDays: number): Observable<any> {
    const headers = this.getHeaders();
    // Append the ban duration as a query parameter
    const url = `${environment.appUrl}/api/admin/ban-user-temporarily/${encodeURIComponent(username)}?banDurationInDays=${banDurationInDays}`;
    return this.http.post<any>(url, {}, { headers });
  }

  /**
   * Apaga um utilizador do sistema pelo seu nome de utilizador.
   * 
   * @param username O nome de utilizador do utilizador a ser apagado.
   * @returns Um Observable que emite o resultado da operação de apagar.
   */
  deleteUserByUsername(username: string): Observable<any> {
    const headers = this.getHeaders();
    return this.http.delete(`${environment.appUrl}/api/admin/users/${encodeURIComponent(username)}`,
      { headers, responseType: 'text' }); // Expecting a text response
  }

  /**
  * Obtém o papel de um utilizador no sistema.
  * 
  * @param username O nome de utilizador do utilizador cujo papel é solicitado.
  * @returns Um Observable que emite os papéis do utilizador.
  */
  getUserRole(username: string): Observable<string[]> {
    return this.http.get<string[]>(`${environment.appUrl}/api/admin/getUserRole/${username}`);
  }

  /**
   * Revoga a proibição de um utilizador, permitindo o seu acesso ao sistema novamente.
   * 
   * @param username O nome de utilizador do utilizador a ser desproibido.
   * @returns Um Observable que emite o resultado da operação de desproibição.
   */
  unbanUser(username: string): Observable<any> {
    const headers = this.getHeaders();
    return this.http.put<any>(`${environment.appUrl}/api/admin/unban-user/${encodeURIComponent(username)}`, {}, { headers });
  }

  /**
   * Altera o papel de um utilizador para Moderador.
   * 
   * @param username O nome de utilizador do utilizador cujo papel será alterado para Moderador.
   * @returns Um Observable que emite o resultado da operação de alteração de papel.
   */
  changeRoleToModerator(username: string): Observable<any> {
    const headers = this.getHeaders();
    return this.http.put(`${environment.appUrl}/api/admin/change-role-to-moderator/${encodeURIComponent(username)}`, {}, {
      headers: headers,
      responseType: 'text'
    });
  }

  /**
   * Altera o papel de um utilizador para Utilizador.
   * 
   * @param username O nome de utilizador do utilizador cujo papel será alterado para Utilizador.
   * @returns Um Observable que emite o resultado da operação de alteração de papel.
   */
  changeRoleToUser(username: string): Observable<any> {
    const headers = this.getHeaders();
    return this.http.put(`${environment.appUrl}/api/admin/change-role-to-user/${encodeURIComponent(username)}`, {}, {
      headers: headers,
      responseType: 'text'
    });
  }

  /**
   * Obtém o número total de utilizadores registados no sistema.
   * 
   * @returns Um Observable que emite o número total de utilizadores registados.
   */
  getTotalRegisteredUsers(): Observable<number> {
    const headers = this.getHeaders();
    return this.http.get<number>(`${environment.appUrl}/api/admin/total-registered-users`, { headers });
  }

  /**
   * Obtém o número total de utilizadores proibidos no sistema.
   * 
   * @returns Um Observable que emite o número total de utilizadores proibidos.
   */
  getTotalBannedUsers(): Observable<number> {
    const headers = this.getHeaders();
    return this.http.get<number>(`${environment.appUrl}/api/admin/total-banned-users`, { headers });
  }

  /**
   * Obtém o número total de perfis privados no sistema.
   * 
   * @returns Um Observable que emite o número total de perfis privados.
   */
  getTotalPrivateProfiles(): Observable<number> {
    const headers = this.getHeaders();
    return this.http.get<number>(`${environment.appUrl}/api/admin/total-private-profiles`, { headers });
  }

  /**
  * Obtém o número total de perfis públicos no sistema.
  * 
  * @returns Um Observable que emite o número total de perfis públicos.
  */
  getTotalPublicProfiles(): Observable<number> {
    const headers = this.getHeaders();
    return this.http.get<number>(`${environment.appUrl}/api/admin/total-public-profiles`, { headers });
  }

  /**
   * Obtém o número total de comentários feitos no sistema.
   * 
   * @returns Um Observable que emite o número total de comentários.
   */
  getTotalComments(): Observable<number> {
    const headers = this.getHeaders();
    return this.http.get<number>(`${environment.appUrl}/api/admin/total-comments`, { headers });
  }

}
