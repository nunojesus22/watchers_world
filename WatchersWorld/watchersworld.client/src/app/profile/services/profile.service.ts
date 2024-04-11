import { HttpClient, HttpHeaders } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { Router } from '@angular/router';
import { Observable } from 'rxjs';
import { User } from '../../authentication/models/user';
import { environment } from '../../../environments/environment.development';
import { Profile } from '../models/profile';
import { FollowerProfile } from '../models/follower-profile';
import { UserMedia } from '../models/user-media';

/**
 * Este serviço é responsável pela gestão de operações relacionadas ao perfil do utilizador,
 * como obter e atualizar dados do perfil, seguir e deixar de seguir utilizadores,
 * obter listas de media favoritos e outras ações relacionadas.
 */
@Injectable({
  providedIn: 'root'
})
export class ProfileService {
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
    const headers = new HttpHeaders({
      'Content-Type': 'application/json',
      'Authorization': `Bearer ${jwt}`
    });
    return headers;
  }

  /**
   * Obtém os dados do perfil de um utilizador específico.
   * 
   * @param username O nome de utilizador cujos dados do perfil são solicitados.
   * @returns Um Observable que emite os dados do perfil do utilizador.
   */
  getUserData(username: string): Observable<Profile> {
    const headers = this.getHeaders();
    return this.http.get<Profile>(`${environment.appUrl}/api/profile/get-user-info/${username}`, { headers });
  }

  /**
   * Atualiza os dados do perfil de um utilizador.
   * 
   * @param model Os dados do perfil a serem atualizados.
   * @returns Um Observable que emite o resultado da operação de atualização.
   */
  setUserData(model: Profile): Observable<any> {
    const headers = this.getHeaders();
    return this.http.put<Profile>(`${environment.appUrl}/api/profile/update-user-info`, model, { headers });
  }

  /**
  * Obtém os perfis de todos os utilizadores.
  * 
  * @returns Um Observable que emite uma lista de perfis de utilizadores.
  */
  getUserProfiles(): Observable<Profile[]> {
    const headers = this.getHeaders();
    return this.http.get<Profile[]>(`${environment.appUrl}/api/profile/get-users-profiles`, { headers });
  }

  /**
   * Obtém os perfis de utilizadores que não estão atualmente logados.
   * 
   * @param username O nome de utilizador do perfil a ser excluído da lista.
   * @returns Um Observable que emite uma lista de perfis de utilizadores excluindo o utilizador atual.
   */
  getUserProfilesNotLoggedIn(username: string): Observable<Profile[]> {
    const headers = this.getHeaders();
    return this.http.get<Profile[]>(`${environment.appUrl}/api/profile/get-users-profiles-not-logged-in/${username}`, { headers });
  }

  /**
   * Permite a um utilizador seguir outro utilizador.
   * 
   * @param usernameAuthenticated O nome de utilizador que realizará a ação de seguir.
   * @param usernameToFollow O nome de utilizador do perfil a ser seguido.
   * @returns Um Observable que emite o resultado da operação de seguir.
   */
  followUser(usernameAuthenticated: string, usernameToFollow: string): Observable<any> {
    const headers = this.getHeaders();
    return this.http.post<any>(`${environment.appUrl}/api/profile/follow/${usernameAuthenticated}/${usernameToFollow}`, {}, { headers });
  }

  /**
   * Permite a um utilizador deixar de seguir outro utilizador.
   * 
   * @param usernameAuthenticated O nome de utilizador que realizará a ação de deixar de seguir.
   * @param usernameToFollow O nome de utilizador do perfil a ser deixado de seguir.
   * @returns Um Observable que emite o resultado da operação de deixar de seguir.
   */
  unfollowUser(usernameAuthenticated: string, usernameToFollow: string): Observable<any> {
    const headers = this.getHeaders();
    return this.http.delete<any>(`${environment.appUrl}/api/profile/unfollow/${usernameAuthenticated}/${usernameToFollow}`, { headers });
  }

  /**
    * Obtém a lista de seguidores de um determinado utilizador.
    * 
    * @param username O nome de utilizador cuja lista de seguidores é solicitada.
    * @returns Um Observable que emite a lista de perfis que seguem o utilizador especificado.
    */
  getFollowers(username: string): Observable<FollowerProfile[]> {
    const headers = this.getHeaders();
    return this.http.get<FollowerProfile[]>(`${environment.appUrl}/api/profile/get-followers/${username}`, { headers });
  }

  /**
   * Obtém a lista de utilizadores que um determinado utilizador segue.
   * 
   * @param username O nome de utilizador cuja lista de seguidos é solicitada.
   * @returns Um Observable que emite a lista de perfis seguidos pelo utilizador especificado.
   */
  getFollowing(username: string): Observable<FollowerProfile[]> {
    const headers = this.getHeaders();
    return this.http.get<FollowerProfile[]>(`${environment.appUrl}/api/profile/get-whoFollow/${username}`, { headers });
  }

  /**
  * Verifica se o utilizador autenticado já segue outro utilizador específico.
  * 
  * @param usernameAuthenticated O nome de utilizador do utilizador autenticado.
  * @param usernameToFollow O nome de utilizador do perfil potencialmente seguido.
  * @returns Um Observable que emite um valor booleano indicando se já existe uma relação de seguimento.
  */
  alreadyFollows(usernameAuthenticated: string, usernameToFollow: string): Observable<boolean> {
    const headers = this.getHeaders();
    return this.http.get<boolean>(`${environment.appUrl}/api/profile/alreadyFollows/${usernameAuthenticated}/${usernameToFollow}`, { headers });
  }

  /**
  * Obtém a lista de media favoritos de um utilizador.
  * 
  * @param username O nome de utilizador cuja lista de media favoritos é solicitada.
  * @returns Um Observable que emite uma lista de media favoritos do utilizador.
  */
  getFavoriteMedia(username: string): Observable<UserMedia[]> {
    const headers = this.getHeaders();
    return this.http.get<UserMedia[]>(`${environment.appUrl}/api/media/get-media-favorites-list/${username}`, { headers });
  }

   /**
   * Obtém a lista de media assistidos por um utilizador.
   * 
   * @param username O nome de utilizador cuja lista de media assistidos é solicitada.
   * @returns Um Observable que emite uma lista de media assistidos pelo utilizador.
   */
  getUserWatchedMedia(username: string): Observable<UserMedia[]> {
    const headers = this.getHeaders();
    return this.http.get<UserMedia[]>(`${environment.appUrl}/api/media/get-media-watched-list/${username}`, { headers });
  }

   /**
   * Obtém a lista de media para assistir mais tarde por um utilizador.
   * 
   * @param username O nome de utilizador cuja lista de media para assistir mais tarde é solicitada.
   * @returns Um Observable que emite uma lista de media marcados para assistir mais tarde pelo utilizador.
   */
  getUserWatchLaterMedia(username: string): Observable<UserMedia[]> {
    const headers = this.getHeaders();
    return this.http.get<UserMedia[]>(`${environment.appUrl}/api/media/get-watch-later-list/${username}`, { headers });
  }

   /**
   * Bane permanentemente um utilizador do sistema.
   * 
   * @param username O nome de utilizador do perfil a ser banido permanentemente.
   * @returns Um Observable que emite o resultado da operação de banimento.
   */
  banUserPermanently(username: string): Observable<any> {
    const headers = this.getHeaders();
    return this.http.post<any>(`${environment.appUrl}/api/account/ban-user-permanently/${encodeURIComponent(username)}`, {}, { headers });
  }

   /**
   * Bane um utilizador temporariamente do sistema.
   * 
   * @param username O nome de utilizador do perfil a ser banido temporariamente.
   * @param banDurationInDays A duração do banimento em dias.
   * @returns Um Observable que emite o resultado da operação de banimento temporário.
   */
  BanUserTemporarily(username: string, banDurationInDays: number): Observable<any> {
    const headers = this.getHeaders();
    const url = `${environment.appUrl}/api/account/ban-user-temporarily/${encodeURIComponent(username)}?banDurationInDays=${banDurationInDays}`;
    return this.http.post<any>(url, {}, { headers });
  }

   /**
   * Obtém o(s) papel(eis) de um utilizador no sistema.
   * 
   * @param username O nome de utilizador cujo(s) papel(eis) é(são) solicitado(s).
   * @returns Um Observable que emite uma lista contendo o(s) papel(eis) do utilizador.
   */
  getUserRole(username: string) {
    return this.http.get<string[]>(`${environment.appUrl}/api/account/getUserRole/${username}`);
  }

   /**
   * Obtém as solicitações de seguimento pendentes para um utilizador.
   * 
   * @param username O nome de utilizador cujas solicitações pendentes são solicitadas.
   * @returns Um Observable que emite uma lista de perfis que enviaram solicitações de seguimento.
   */
  getPendingFollowRequests(username: string): Observable<FollowerProfile[]> {
    const headers = this.getHeaders();
    return this.http.get<FollowerProfile[]>(`${environment.appUrl}/api/profile/get-whosPending/${username}`, { headers });
  }

   /**
   * Aceita uma solicitação de seguimento de outro utilizador.
   * 
   * @param usernameAuthenticated O nome de utilizador do utilizador autenticado que aceita a solicitação.
   * @param usernameWhoSend O nome de utilizador do perfil que enviou a solicitação de seguimento.
   * @returns Um Observable que emite o resultado da operação de aceitação de seguimento.
   */
  acceptFollowRequest(usernameAuthenticated: string, usernameWhoSend: string): Observable<any> {
    const headers = this.getHeaders();
    return this.http.post<any>(`${environment.appUrl}/api/profile/acceptFollow/${usernameAuthenticated}/${usernameWhoSend}`, {}, { headers });
  }

   /**
   * Rejeita uma solicitação de seguimento de outro utilizador.
   * 
   * @param usernameAuthenticated O nome de utilizador do utilizador autenticado que rejeita a solicitação.
   * @param usernameWhoSend O nome de utilizador do perfil que enviou a solicitação de seguimento.
   * @returns Um Observable que emite o resultado da operação de rejeição de seguimento.
   */
  rejectFollowRequest(usernameAuthenticated: string, usernameWhoSend: string): Observable<any> {
    const headers = this.getHeaders();
    return this.http.delete<any>(`${environment.appUrl}/api/profile/rejectFollow/${usernameAuthenticated}/${usernameWhoSend}`, { headers });
  }

   /**
   * Obtém o total de comentários feitos por um utilizador.
   * 
   * @param username O nome do utilizador cujo total de comentários é solicitado.
   * @returns Um Observable que emite o número total de comentários feitos pelo utilizador.
   */
  getUserTotalComments(username: string): Observable<number> {
    const headers = this.getHeaders();
    return this.http.get<number>(`${environment.appUrl}/api/media/get-total-comments/${username}`, { headers });
  }

   /**
   * Obtém o total de likes recebidos nos comentários de um utilizador.
   * 
   * @param username O nome do utilizador cujo total de likes recebidos é solicitado.
   * @returns Um Observable que emite o número total de likes recebidos pelo utilizador em seus comentários.
   */
  getUserTotalLikesReceived(username: string): Observable<number> {
    const headers = this.getHeaders();
    return this.http.get<number>(`${environment.appUrl}/api/media/get-total-likes-received/${username}`, { headers });
  }

   /**
   * Obtém o total de tentativas em quizzes feitas por um utilizador.
   * 
   * @param username O nome do utilizador cujo total de tentativas em quizzes é solicitado.
   * @returns Um Observable que emite o número total de tentativas feitas pelo utilizador em quizzes.
   */
  getTotalQuizAttempts(username: string): Observable<number> {
    const headers = this.getHeaders();
    return this.http.get<number>(`${environment.appUrl}/api/quiz/total-attempts/${username}`, { headers });
  }

   /**
   * Obtém o total de atores favoritos escolhidos pelos utilizadores na plataforma.
   * 
   * @returns Um Observable que emite o número total de atores favoritos escolhidos por todos os utilizadores.
   */
  getTotalFavoriteActors(): Observable<number> {
    const headers = this.getHeaders();
    return this.http.get<number>(`${environment.appUrl}/api/FavoriteActorChoice/get-total-favorite-actors`, { headers });
  }

   /**
   * Obtém o total de avaliações feitas por um utilizador.
   * 
   * @returns Um Observable que emite o número total de avaliações feitas pelo utilizador.
   */
  getTotalRatingsByUser(): Observable<number> {
    const headers = this.getHeaders();
    return this.http.get<number>(`${environment.appUrl}/api/UserRatingMedia/get-rating-by-user`, { headers });
  }

   /**
   * Obtém o total de medalhas conquistadas por um utilizador.
   * 
   * @param username O nome do utilizador cujo total de medalhas conquistadas é solicitado.
   * @returns Um Observable que emite o número total de medalhas conquistadas pelo utilizador.
   */
  getUserTotalMedals(username: string): Observable<number> {
    const headers = this.getHeaders();
    return this.http.get<number>(`${environment.appUrl}/api/gamification/medals/${username}`, { headers });
  }

   /**
   * Permite a um utilizador eliminar a sua própria conta e todos os dados associados.
   * 
   * @param username O nome do utilizador que deseja eliminar a sua conta.
   * @returns Um Observable que emite o resultado da operação de eliminação da conta.
   */
  deleteOwnAccount(username: string): Observable<any> {
    const headers = this.getHeaders();
    return this.http.delete<any>(`${environment.appUrl}/api/profile/deleteAccount/${username}`, { headers });
  }
}
