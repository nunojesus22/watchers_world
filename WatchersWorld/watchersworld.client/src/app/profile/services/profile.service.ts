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

  getUserData(): Observable<Profile> {
    return this.http.get<Profile>(`${environment.appUrl}/api/profile/get-user-info`);
  }

  setUserData(model: Profile) {
    return this.http.put<Profile>(`${environment.appUrl}/api/profile/update-user-info`, model);
  }

}
