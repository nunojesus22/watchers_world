import { Component, OnInit } from '@angular/core';
import { AuthenticationService } from '../services/authentication.service';
import { ActivatedRoute, Router } from '@angular/router';
import { take } from 'rxjs';
import { User } from '../models/user';
import { ConfirmEmail } from '../models/confirmEmail';

@Component({
  selector: 'app-pending-verification',
  templateUrl: './pending-verification.component.html',
  styleUrl: './pending-verification.component.css'
})
export class PendingVerificationComponent implements OnInit{
  success = true;

  constructor(private authService: AuthenticationService,
    private router: Router,
    private activatedRouter: ActivatedRoute
  ) {

  }
  ngOnInit(): void {
    this.authService.user$.pipe(take(1)).subscribe({
      next: (user: User | null) => {
        if (user) {
          this.router.navigateByUrl('/home');
        }
        else {
          this.activatedRouter.queryParamMap.subscribe({
            next: (params: any) => {
              const confirmEmail: ConfirmEmail = {
                token: params.get('token'),
                email: params.get('email')
              }

              if (confirmEmail.email == undefined || confirmEmail.token == undefined) {
                this.success = false;
              }
              else {
                this.authService.confirmEmail(confirmEmail).subscribe({
                  next: (response: any) => {
                    this.router.navigateByUrl('/account/login');
                  },
                  error: (error) => {
                    console.log(error);
                    this.success = false;
                  }
                });
              }
            },
            error: error => {
              console.log(error);
              this.success = false;
            }
          })
        }
      }
    })
  }

  resendEmailConfirmationLink() {
    this.router.navigateByUrl('/account/send-email/resend-email-confirmation-link');
  }

  login() {
    this.router.navigateByUrl('/account/login');
  }
}
