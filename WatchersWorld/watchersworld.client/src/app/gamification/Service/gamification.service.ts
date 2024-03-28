import { HttpClient, HttpHeaders } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { Router } from '@angular/router';
import { environment } from '../../../environments/environment.development';
import { User } from '../../authentication/models/user';
import { Observable } from 'rxjs';

@Injectable({
  providedIn: 'root'
})
export class GamificationService {

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



  /*
  banUserPermanently(username: string): Observable<any> {
    const headers = this.getHeaders();
    return this.http.post<any>(`${environment.appUrl}/api/admin/ban-user-permanently/${encodeURIComponent(username)}`, {}, { headers });
  }
  */

  getUnlockedMedals(userName: string): Observable<any[]> {
    const headers = this.getHeaders();
    return this.http.get<any[]>(`${environment.appUrl}/api/gamification/unlocked-medals/${userName}`, { headers });
  }


  awardMedal(userName: string, medalName: string): Observable<any> {
    const headers = this.getHeaders();
    return this.http.post<any>(`${environment.appUrl}/api/gamification/AwardMedal`, { userName, medalName }, { headers });
  }
}
