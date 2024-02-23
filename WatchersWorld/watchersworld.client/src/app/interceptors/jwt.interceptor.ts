import { Injectable } from '@angular/core'
import { HttpRequest, HttpHandler, HttpEvent, HttpInterceptor } from '@angular/common/http';
import { Observable, take } from 'rxjs';
import { AuthenticationService } from '../authentication/services/authentication.service';

@Injectable()

export class JwtInterceptor implements HttpInterceptor {

  constructor(private authService : AuthenticationService) { }

  intercept(req: HttpRequest<any>, next: HttpHandler): Observable<HttpEvent<any>> {
    this.authService.user$.pipe(take(1)).subscribe({
      next: user => {
        if (user) {
          //adiciona o header da autorização igual ao do pedido
          req = req.clone({
            setHeaders: {
              Authorization: `Bearer ${user.jwt}`
            }
          });
        }
      }
    })
    return next.handle(req);
  }

  
}
