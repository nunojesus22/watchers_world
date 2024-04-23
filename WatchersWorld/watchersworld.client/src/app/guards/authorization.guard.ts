import { Injectable } from '@angular/core';
import { ActivatedRouteSnapshot, CanActivate, Router, RouterStateSnapshot } from '@angular/router';
import { AuthenticationService } from '../authentication/services/authentication.service';
import { Observable, map } from 'rxjs';
import { User } from '../authentication/models/user';

@Injectable({
  providedIn: 'root'
})
export class AuthorizationGuard implements CanActivate {
  constructor(private authService: AuthenticationService,
    private router: Router) { }

  canActivate(
    route: ActivatedRouteSnapshot,
    state: RouterStateSnapshot): Observable<boolean> {
    return this.authService.user$.pipe(
      map((user: User | null) => {
        // Verifique se um usuário está logado
        if (!user) {
          console.log("Área restrita.");
          this.router.navigate(["/account/login"], { queryParams: { returnUrl: state.url } });
          return false;
        }

        // Se a rota contiver um parâmetro 'username', verifique se corresponde ao do usuário logado
        const requestedUsername = route.paramMap.get('username');
        if (requestedUsername && user.username !== requestedUsername) {
          // Se não corresponder, redirecione para 'Not Found' ou outra rota apropriada
          this.router.navigate(["/page-not-found"]);
          return false;
        }
        return true;
      })
    );
  }
};
