import { HttpClient, HttpHeaders } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { Router } from '@angular/router';
import { Observable } from 'rxjs';
import { User } from '../../authentication/models/user';
import { environment } from '../../../environments/environment.development';
import { Profile } from '../models/profile';
import { FollowerProfile } from '../models/follower-profile';
import { UserMedia } from '../models/user-media';

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

  followUser(usernameAuthenticated : string, usernameToFollow: string): Observable<any> {
    const headers = this.getHeaders();
    return this.http.post<any>(`${environment.appUrl}/api/profile/follow/${usernameAuthenticated}/${usernameToFollow}`, {}, { headers });
  }

  unfollowUser(usernameAuthenticated: string, usernameToFollow: string): Observable<any> {
    const headers = this.getHeaders();
    return this.http.delete<any>(`${environment.appUrl}/api/profile/unfollow/${usernameAuthenticated}/${usernameToFollow}`, { headers });
  }

  getFollowers(username: string): Observable<FollowerProfile[]> {
    const headers = this.getHeaders();
    return this.http.get<FollowerProfile[]>(`${environment.appUrl}/api/profile/get-followers/${username}`, { headers });
  }

  getFollowing(username: string): Observable<FollowerProfile[]> {
    const headers = this.getHeaders();
    return this.http.get<FollowerProfile[]>(`${environment.appUrl}/api/profile/get-whoFollow/${username}`, { headers });
  }

  alreadyFollows(usernameAuthenticated: string, usernameToFollow: string): Observable<boolean> {
    const headers = this.getHeaders();
    return this.http.get<boolean>(`${environment.appUrl}/api/profile/alreadyFollows/${usernameAuthenticated}/${usernameToFollow}`, { headers });
  }

  getUserWatchedMedia(username: string): Observable<UserMedia[]> {
    const headers = this.getHeaders();
    return this.http.get<UserMedia[]>(`${environment.appUrl}/api/media/get-media-watched-list/${username}`, { headers });
  }

  getUserWatchLaterMedia(username: string): Observable<UserMedia[]> {
    const headers = this.getHeaders();
    return this.http.get<UserMedia[]>(`${environment.appUrl}/api/media/get-watch-later-list/${username}`, { headers });
  }


}
