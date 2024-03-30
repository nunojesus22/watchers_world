import { HttpClient, HttpHeaders } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';
import { environment } from '../../../environments/environment.development';
import { User } from '../../authentication/models/user';
import { Observable } from 'rxjs';
import { MedalsDto } from '../models/MedalsDto';

@Injectable({
  providedIn: 'root'
})
export class GamificationService {

  

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



  getUnlockedMedals(userName: string): Observable<MedalsDto[]> {
    const headers = this.getHeaders();
    return this.http.get<MedalsDto[]>(`${environment.appUrl}/api/gamification/unlocked-medals/${userName}`, { headers });
  }


  awardMedal(userName: string, medalName: string): Observable<MedalsDto[]> {
    const headers = this.getHeaders();
    return this.http.post<MedalsDto[]>(`${environment.appUrl}/api/gamification/AwardMedal`, { userName, medalName }, { headers });
  }


  getAvailableMedals(): Observable<MedalsDto[]> {
    return this.http.get<MedalsDto[]>(`${environment.appUrl}/api/gamification/available-medals`);
  }

  getLockedMedals(userName: string): Observable<MedalsDto[]> {
    const headers = this.getHeaders();
    return this.http.get<MedalsDto[]>(`${environment.appUrl}/api/gamification/locked-medals/${userName}`, { headers });
  }

}
