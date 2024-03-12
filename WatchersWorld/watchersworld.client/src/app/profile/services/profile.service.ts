import { HttpClient, HttpHeaders } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { Router } from '@angular/router';
import { Observable } from 'rxjs';
import { User } from '../../authentication/models/user';
import { environment } from '../../../environments/environment.development';
import { Profile } from '../models/profile';

@Injectable({
  providedIn: 'root'
})
export class ProfileService {
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

  getUserData(username: string): Observable<Profile> {
    const headers = this.getHeaders();
    return this.http.get<Profile>(`${environment.appUrl}/api/profile/get-user-info/${username}`, {headers});
  }

  setUserData(model: Profile) {
    return this.http.put<Profile>(`${environment.appUrl}/api/profile/update-user-info`, model);
  }

  getUserProfiles(): Observable<Profile[]> {
    const headers = this.getHeaders();
    return this.http.get<Profile[]>(`${environment.appUrl}/api/profile/get-users-profiles`, {headers});
  }

  followUser(usernameToFollow: string): Observable<any> {
    const headers = this.getHeaders();
    return this.http.post<any>(`${environment.appUrl}/api/profile/follow/${usernameToFollow}`, {}, { headers });
  }

  unfollowUser(usernameToUnfollow: string): Observable<any> {
    const headers = this.getHeaders();
    return this.http.delete<any>(`${environment.appUrl}/api/profile/unfollow/${usernameToUnfollow}`, { headers });
  }

  deleteUserByUsername(username: string): Observable<any> {
    const headers = this.getHeaders();
    return this.http.delete(`${environment.appUrl}/api/users/${encodeURIComponent(username)}`, { headers });
  }





}
