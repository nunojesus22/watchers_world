import { HttpClient, HttpHeaders } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { Observable } from 'rxjs';
import { environment } from '../../../environments/environment.development';
import { NotificationModel } from '../models/notification-model';
import { User } from '../../authentication/models/user';
import { FollowNotificationModel } from '../models/follow-notification-model';
import { ReplyNotificationModel } from '../models/reply-notification-model';

@Injectable({
  providedIn: 'root'
})
export class NotificationService {
  constructor(private http: HttpClient) { }

  getJWT() {
    const key = localStorage.getItem(environment.userKey);
    if (key) {
      const user = JSON.parse(key) as User;
      return user.jwt;
    } else {
      return 'No JWT';
    }
  }

  getHeaders() {
    const jwt = this.getJWT();

    // Set up the headers with the authentication token
    const headers = new HttpHeaders({
      'Content-Type': 'application/json',
      'Authorization': `Bearer ${jwt}`
    });

    return headers;
  }

  // Método para criar uma notificação de seguir um usuário
  createFollowNotification(usernameAuthenticated: string, usernameToFollow: string): Observable<any> {
    const headers = this.getHeaders();
    return this.http.post(`${environment.appUrl}/api/notifications/create-notification/${usernameAuthenticated}/${usernameToFollow}`, {}, { headers });
  }

  getFollowNotificationsForUser(authenticatedUsername: string): Observable<FollowNotificationModel[]> {
    const headers = this.getHeaders();
    return this.http.get<FollowNotificationModel[]>(`${environment.appUrl}/api/notifications/followNotifications/${authenticatedUsername}`, { headers });
  }

  // Método para buscar notificações de resposta
  getReplyNotifications(username: string): Observable<ReplyNotificationModel[]> {
    const headers = this.getHeaders();
    return this.http.get<ReplyNotificationModel[]>(`${environment.appUrl}/api/notifications/replyNotifications/${username}`, { headers });
  }

  // Método para criar uma notificação de seguir um usuário
  markAllFollowNotificationsAsRead(username: string): Observable<any> {
    const headers = this.getHeaders();
    return this.http.post(`${environment.appUrl}/api/notifications/followNotifications/mark-all-as-read/${username}`, {}, { headers });
  }

  // Método para criar uma notificação de seguir um usuário
  markAllReplyNotificationsAsRead(username: string): Observable<any> {
    const headers = this.getHeaders();
    return this.http.post(`${environment.appUrl}/api/notifications/replyNotifications/mark-all-as-read/${username}`, {}, { headers });
  }

}
