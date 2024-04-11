import { HttpClient, HttpHeaders } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { Observable } from 'rxjs';
import { environment } from '../../../environments/environment.development';
import { NotificationModel } from '../models/notification-model';
import { User } from '../../authentication/models/user';
import { FollowNotificationModel } from '../models/follow-notification-model';
import { ReplyNotificationModel } from '../models/reply-notification-model';
import { AchievementNotificationModel } from '../models/achievement-notification-model';
import { MessageNotificationModel } from '../models/message-notification-model';
import { MediaNotificationModel } from '../models/media-notification-model';

/**
 * Serviço responsável por gerenciar todas as operações relacionadas às notificações dos utilizadores,
 * incluindo a obtenção de diferentes tipos de notificações, marcar notificações como lidas e limpar notificações.
 */
@Injectable({
  providedIn: 'root'
})
export class NotificationService {
  constructor(private http: HttpClient) { }

  /**
   * Recupera o token JWT do localStorage para uso nas requisições autenticadas.
   * @returns O token JWT se disponível; caso contrário, retorna 'No JWT'.
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
   * Constrói o cabeçalho HTTP necessário para as requisições autenticadas.
   * @returns Um objeto HttpHeaders com o token de autenticação.
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
   * Obtém as notificações de novos seguidores para um utilizador autenticado.
   * @param authenticatedUsername O nome do utilizador autenticado.
   * @returns Um Observable de um array de FollowNotificationModel.
   */
  getFollowNotificationsForUser(authenticatedUsername: string): Observable<FollowNotificationModel[]> {
    const headers = this.getHeaders();
    return this.http.get<FollowNotificationModel[]>(`${environment.appUrl}/api/notifications/followNotifications/${authenticatedUsername}`, { headers });
  }

  /**
   * Obtém as notificações de respostas a comentários para um utilizador específico.
   * @param username O nome do utilizador.
   * @returns Um Observable de um array de ReplyNotificationModel.
   */
  getReplyNotifications(username: string): Observable<ReplyNotificationModel[]> {
    const headers = this.getHeaders();
    return this.http.get<ReplyNotificationModel[]>(`${environment.appUrl}/api/notifications/replyNotifications/${username}`, { headers });
  }

  /**
  * Obtém as notificações de novas conquistas para um utilizador autenticado.
  * @param username O nome do utilizador autenticado.
  * @returns Um Observable de um array de AchievementNotificationModel.
  */
  getAchievementNotifications(username: string): Observable<AchievementNotificationModel[]> {
    const headers = this.getHeaders();
    return this.http.get<AchievementNotificationModel[]>(`${environment.appUrl}/api/notifications/achievementNotifications/${username}`, { headers });
  }

  /**
  * Obtém as notificações de novas mensagens para um utilizador autenticado.
  * @param authenticatedUsername O nome do utilizador autenticado.
  * @returns Um Observable de um array de MessageNotificationModel.
  */
  getMessageNotificationsForUser(authenticatedUsername: string): Observable<MessageNotificationModel[]> {
    const headers = this.getHeaders();
    return this.http.get<MessageNotificationModel[]>(`${environment.appUrl}/api/notifications/messageNotifications/${authenticatedUsername}`, { headers });
  }

  /**
   * Marca todas as notificações de novo seguidor como lidas para um utilizador específico.
   * @param username O nome do utilizador.
   * @returns Um Observable do resultado da operação.
   */
  markAllFollowNotificationsAsRead(username: string): Observable<any> {
    const headers = this.getHeaders();
    return this.http.post(`${environment.appUrl}/api/notifications/followNotifications/mark-all-as-read/${username}`, {}, { headers });
  }

  /**
   * Marca todas as notificações de novas respostas como lidas para um utilizador específico.
   * @param username O nome do utilizador.
   * @returns Um Observable do resultado da operação.
   */
  markAllReplyNotificationsAsRead(username: string): Observable<any> {
    const headers = this.getHeaders();
    return this.http.post(`${environment.appUrl}/api/notifications/replyNotifications/mark-all-as-read/${username}`, {}, { headers });
  }

  /**
   * Marca todas as notificações de novas conquistas como lidas para um utilizador específico.
   * @param username O nome do utilizador.
   * @returns Um Observable do resultado da operação.
   */
  markAllAchievementNotificationsAsRead(username: string): Observable<any> {
    const headers = this.getHeaders();
    return this.http.post(`${environment.appUrl}/api/notifications/achievementNotifications/mark-all-as-read/${username}`, {}, { headers });
  }

  /**
   * Marca todas as notificações de novas mensagens como lidas para um utilizador específico.
   * @param username O nome do utilizador.
   * @returns Um Observable do resultado da operação.
   */
  markAllMessageNotificationsAsRead(username: string): Observable<any> {
    const headers = this.getHeaders();
    return this.http.post(`${environment.appUrl}/api/notifications/messageNotifications/mark-all-as-read/${username}`, {}, { headers });
  }

  /**
  * Limpa todas as notificações para um utilizador específico.
  * @param username O nome do utilizador cujas notificações serão limpas.
  * @returns Um Observable do resultado da operação.
  */
  clearNotifications(username: string): Observable<any> {
    const headers = this.getHeaders();
    return this.http.delete(`${environment.appUrl}/api/notifications/clearNotifications/${username}`, { headers });
  }

  /**
  * Verifica se um utilizador possui notificações não lidas.
  * @param username O nome do utilizador.
  * @returns Um Observable que emite verdadeiro se houver notificações não lidas; falso caso contrário.
  */
  hasUnreadNotifications(username: string): Observable<any> {
    const headers = this.getHeaders();
    return this.http.get(`${environment.appUrl}/api/notifications/hasUnread/${username}`, { headers });
  }

  /**
  * Notifica os utilizadores sobre um novo episódio de uma série ou atualização de mídia.
  * @param notification A notificação a ser enviada, contendo detalhes como o ID do usuário que disparou a notificação, mensagem, etc.
  * @returns Um Observable do resultado da operação de notificação.
  */
  notifyNewEpisode(notification: MediaNotificationModel): Observable<any> {
    const headers = this.getHeaders();
    const body = {
      triggeredByUserId: notification.triggeredByUserId,
      message: notification.message,
      createdAt: notification.createdAt,
      isRead: notification.isRead,
      eventType: notification.eventType,
      mediaName: notification.mediaName,
      mediaPhoto: notification.mediaPhoto,
      userMediaId: notification.userMediaId
    };
    return this.http.post(`${environment.appUrl}/api/notifications/notify-new-episode`, body, { headers });
  }

  /**
  * Obtém as notificações de nova mídia para um utilizador específico.
  * @param username O nome do utilizador cujas notificações de nova mídia são solicitadas.
  * @returns Um Observable de um array de MediaNotificationModel, representando as notificações de nova mídia.
  */
  getMediaNotifications(username: string): Observable<MediaNotificationModel[]> {
    const headers = this.getHeaders();
    return this.http.get<MediaNotificationModel[]>(`${environment.appUrl}/api/notifications/mediaNotifications/${username}`, { headers });
  }

  /**
  * Marca todas as notificações de nova mídia como lidas para um utilizador específico.
  * @param username O nome do utilizador.
  * @returns Um Observable do resultado da operação.
  */
  markAllMediaNotificationsAsRead(username: string): Observable<any> {
    const headers = this.getHeaders();
    return this.http.post(`${environment.appUrl}/api/notifications/mediaNotifications/mark-all-as-read/${username}`, {}, { headers });
  }
}
