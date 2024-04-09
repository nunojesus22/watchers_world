import { HttpClient, HttpHeaders } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { Router } from '@angular/router';
import { Observable } from 'rxjs';
import { User } from '../../authentication/models/user';
import { environment } from '../../../environments/environment.development';
import { Profile } from '../../profile/models/profile';


@Injectable({
  providedIn: 'root'
})
export class AdminService {

  constructor(private http: HttpClient, private router: Router) { }

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

  banUserPermanently(username: string): Observable<any> {
    const headers = this.getHeaders();
    return this.http.post<any>(`${environment.appUrl}/api/admin/ban-user-permanently/${encodeURIComponent(username)}`, {}, { headers });
  }

  BanUserTemporarily(username: string, banDurationInDays: number): Observable<any> {
    const headers = this.getHeaders();
    // Append the ban duration as a query parameter
    const url = `${environment.appUrl}/api/admin/ban-user-temporarily/${encodeURIComponent(username)}?banDurationInDays=${banDurationInDays}`;
    return this.http.post<any>(url, {}, { headers });
  }

  deleteUserByUsername(username: string): Observable<any> {
    const headers = this.getHeaders();
    return this.http.delete(`${environment.appUrl}/api/admin/users/${encodeURIComponent(username)}`,
      { headers, responseType: 'text' }); // Expecting a text response
  }

  getUserRole(username: string): Observable<string[]> {
    return this.http.get<string[]>(`${environment.appUrl}/api/admin/getUserRole/${username}`);
  }

  unbanUser(username: string): Observable<any> {
    const headers = this.getHeaders();
    return this.http.put<any>(`${environment.appUrl}/api/admin/unban-user/${encodeURIComponent(username)}`, {}, { headers });
  }

  changeRoleToModerator(username: string): Observable<any> {
    const headers = this.getHeaders();
    return this.http.put(`${environment.appUrl}/api/admin/change-role-to-moderator/${encodeURIComponent(username)}`, {}, {
      headers: headers,
      responseType: 'text'  // Expect a text response
    });
  }

  changeRoleToUser(username: string): Observable<any> {
    const headers = this.getHeaders();
    return this.http.put(`${environment.appUrl}/api/admin/change-role-to-user/${encodeURIComponent(username)}`, {}, {
      headers: headers,
      responseType: 'text'  // Expect a text response
    });
  }
  //ESTATISTICAS
  getTotalRegisteredUsers(): Observable<number> {
    const headers = this.getHeaders();
    return this.http.get<number>(`${environment.appUrl}/api/admin/total-registered-users`, { headers });
  }

  getTotalBannedUsers(): Observable<number> {
    return this.http.get<number>(`${environment.appUrl}/api/admin/total-banned-users`);
  }

  getTotalPrivateProfiles(): Observable<number> {
    return this.http.get<number>(`${environment.appUrl}/api/admin/total-private-profiles`);
  }

  getTotalPublicProfiles(): Observable<number> {
    return this.http.get<number>(`${environment.appUrl}/api/admin/total-public-profiles`);
  }

  getTotalComments(): Observable<number> {
    return this.http.get<number>(`${environment.appUrl}/api/admin/total-comments`);
  }

}
