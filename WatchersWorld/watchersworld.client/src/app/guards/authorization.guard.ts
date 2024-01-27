import { Injectable } from '@angular/core';
import { ActivatedRouteSnapshot, CanActivateFn, Router, RouterStateSnapshot } from '@angular/router';
import { AuthenticationService } from '../authentication/services/authentication.service';
import { Observable, map } from 'rxjs';
import { User } from '../authentication/models/user';

@Injectable({
  providedIn: 'root'
})

export class AuthorizationGuard{
  constructor(private authService: AuthenticationService,
              private router : Router) { }


  canActivate(
    router: ActivatedRouteSnapshot,
    state: RouterStateSnapshot): Observable<boolean> {
    return this.authService.user$.pipe(
      map((user: User | null) => {
        if (user) {
          return true;
        } else {
          console.log("Area restrita.");
          this.router.navigate(["/account/login"], { queryParams: { returnUrl: state.url } });
          return false;
        }
      })
    );
  }
};
