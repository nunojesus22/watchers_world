import { HttpClient, HttpHeaders } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { Observable } from 'rxjs';
import { environment } from '../../../environments/environment.development';
import { NotificationModel } from '../models/notification-model';
import { User } from '../../authentication/models/user';

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

  createNotification(usernameToFollow: string, notification: NotificationModel): Observable<any> {
    const headers = this.getHeaders();
    return this.http.post<any>(`${environment.appUrl}/api/notifications/create-notification/${usernameToFollow}`, notification, { headers });
  }

  getMyNotifications(): Observable<NotificationModel[]> {
    const headers = this.getHeaders();
    return this.http.get<NotificationModel[]>(`${environment.appUrl}/api/notifications/my-notifications`, { headers });
  }

  markNotificationAsRead(notificationId: string): Observable<any> {
    const headers = this.getHeaders();
    return this.http.post<any>(`${environment.appUrl}/api/notifications/mark-as-read/${notificationId}`, {}, { headers });
  }

  markAllNotificationsAsRead(): Observable<any> {
    const headers = this.getHeaders();
    return this.http.post(`${environment.appUrl}/api/notifications/mark-all-as-read`, {}, {headers});
  }

}
