import { HttpClient, HttpHeaders } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { Register } from '../models/register';
import { environment } from '../../../environments/environment.development';
import { Login } from '../models/login';
import { User } from '../models/user';
import { ReplaySubject, map, of } from 'rxjs';
import { Router } from '@angular/router';
import { ConfirmEmail } from '../models/confirmEmail';
import { ResetPassword } from '../models/resetPassword';
import { LoginWithExternal } from '../models/loginWithExternals';
import { RegisterWithExternal } from '../models/registerWithExternal';

@Injectable({
  providedIn: 'root'
})
export class AuthenticationService {
  private userSource = new ReplaySubject<User | null>(1); //apenas um user dentro do user source
  user$ = this.userSource.asObservable();

  constructor(private http: HttpClient, private router : Router) { }

  getLoggedInUserName(): string | null {
    const user = this.getStoredUser();
    return user ? user.username : null;
  }

  private getStoredUser(): User | null {
    const key = localStorage.getItem(environment.userKey);
    return key ? JSON.parse(key) : null;
  }

  getUserRole(username: string) {
    return this.http.get<string[]>(`${environment.appUrl}/api/account/getUserRole/${username}`);
  }

  refreshUser(jwt: string | null) {
    if (jwt === null) {
      this.userSource.next(null);
      return of(undefined);
    }

    let headers = new HttpHeaders();
    headers = headers.set("Authorization", "Bearer " + jwt);

    return this.http.get<User>(`${environment.appUrl}/api/account/refresh-user-token`, { headers }).pipe(
      map((user: User) => {
        if (user) {
          this.setUser(user);
        }
      })
    );
  }

  register(model: Register) {
    return this.http.post(`${environment.appUrl}/api/account/register`, model);
  }

  confirmEmail(model: ConfirmEmail) {
    return this.http.put(`${environment.appUrl}/api/account/confirm-email`, model);
  }

  resendEmailConfirmationLink(email: string) {
    return this.http.post(`${environment.appUrl}/api/account/resend-email-confirmation-link/${email}`, {});
  }

  forgotPassword(email: string) {
    return this.http.post(`${environment.appUrl}/api/account/forgot-password/${email}`, {});
  }

  resetPassword(model: ResetPassword) {
    return this.http.put(`${environment.appUrl}/api/account/reset-password`, model);
  }

  login(model: Login) {
    return this.http.post<User>(`${environment.appUrl}/api/account/login`, model).pipe(
      map((response: any) => {
        var user: User | undefined;
        var message = response.message;

        if (response.message === "A conta está por confirmar!") {
          return message;
        }

        if (response && response.user.email && response.user.jwt && response.user.username) {
          user = new User(response.user.email, response.user.jwt, response.user.username);
          this.setUser(user);
        }
        
        return { user, message };
      }),
    );
  }

  registerWithThirdParty(model: RegisterWithExternal) {
    return this.http.post<User>(`${environment.appUrl}/api/account/register-with-third-party`, model)
      .pipe(
        map((user: User) => {
          if (user) {
            this.setUser(user);
          }
        })
      );
  }

  loginWithThirdParty(model: LoginWithExternal) {
    return this.http.post<User>(`${environment.appUrl}/api/account/login-with-third-party`, model)
      .pipe(
        map((user: User) => {
          if (user) {
            this.setUser(user);
          }
        })
      );
  }

  logout() {
    localStorage.removeItem(environment.userKey);
    this.userSource.next(null);
    this.router.navigateByUrl("/home");
  }

  getJWT() {
    const key = localStorage.getItem(environment.userKey);
    if (key) {
      const user: User = JSON.parse(key);
      return user.jwt;
    } else {
      return null;
    }
  }

  private setUser(user: User) {
    localStorage.setItem(environment.userKey, JSON.stringify(user));
    this.userSource.next(user);
  }
}
