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

  getFollowNotificationsForUser(authenticatedUsername: string): Observable<FollowNotificationModel[]> {
    const headers = this.getHeaders();
    return this.http.get<FollowNotificationModel[]>(`${environment.appUrl}/api/notifications/followNotifications/${authenticatedUsername}`, { headers });
  }

  getReplyNotifications(username: string): Observable<ReplyNotificationModel[]> {
    const headers = this.getHeaders();
    return this.http.get<ReplyNotificationModel[]>(`${environment.appUrl}/api/notifications/replyNotifications/${username}`, { headers });
  }

  getAchievementNotifications(username: string): Observable<AchievementNotificationModel[]> {
    const headers = this.getHeaders();
    return this.http.get<AchievementNotificationModel[]>(`${environment.appUrl}/api/notifications/achievementNotifications/${username}`, { headers });
  }

  getMessageNotificationsForUser(authenticatedUsername: string): Observable<MessageNotificationModel[]> {
    const headers = this.getHeaders();
    return this.http.get<MessageNotificationModel[]>(`${environment.appUrl}/api/notifications/messageNotifications/${authenticatedUsername}`, { headers });
  }

  markAllFollowNotificationsAsRead(username: string): Observable<any> {
    const headers = this.getHeaders();
    return this.http.post(`${environment.appUrl}/api/notifications/followNotifications/mark-all-as-read/${username}`, {}, { headers });
  }

  markAllReplyNotificationsAsRead(username: string): Observable<any> {
    const headers = this.getHeaders();
    return this.http.post(`${environment.appUrl}/api/notifications/replyNotifications/mark-all-as-read/${username}`, {}, { headers });
  }

  markAllAchievementNotificationsAsRead(username: string): Observable<any> {
    const headers = this.getHeaders();
    return this.http.post(`${environment.appUrl}/api/notifications/achievementNotifications/mark-all-as-read/${username}`, {}, { headers });
  }

  markAllMessageNotificationsAsRead(username: string): Observable<any> {
    const headers = this.getHeaders();
    return this.http.post(`${environment.appUrl}/api/notifications/messageNotifications/mark-all-as-read/${username}`, {}, { headers });
  }

  clearNotifications(username: string): Observable<any> {
    const headers = this.getHeaders();
    return this.http.delete(`${environment.appUrl}/api/notifications/clearNotifications/${username}`, { headers });
  }

  hasUnreadNotifications(username: string): Observable<any> {
    const headers = this.getHeaders();
    return this.http.get(`${environment.appUrl}/api/notifications/hasUnread/${username}`, { headers });
  }

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

  getMediaNotifications(username: string): Observable<MediaNotificationModel[]> {
    const headers = this.getHeaders();
    return this.http.get<MediaNotificationModel[]>(`${environment.appUrl}/api/notifications/mediaNotifications/${username}`, { headers });
  }

  markAllMediaNotificationsAsRead(username: string): Observable<any> {
    const headers = this.getHeaders();
    return this.http.post(`${environment.appUrl}/api/notifications/mediaNotifications/mark-all-as-read/${username}`, {}, { headers });
  }
}
