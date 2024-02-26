import { Component } from '@angular/core';
import { AuthenticationService } from '../services/authentication.service';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { ActivatedRoute, Router } from '@angular/router';
import { User } from '../models/user';
import { take } from 'rxjs';
import { ResetPassword } from '../models/resetPassword';

@Component({
  selector: 'app-reset-password',
  templateUrl: './reset-password.component.html',
  styleUrl: './reset-password.component.css'
})
export class ResetPasswordComponent {
  passwordForm: FormGroup = new FormGroup({});
  submitted = false;
  mode: string | undefined;
  errorMessages: any = {};
  submittedValues: any = {};
  passwordValue: string = "";
  token: string | undefined;
  email: string | undefined;

  constructor(private authService: AuthenticationService,
    private formBuilder: FormBuilder,
    private router: Router,
    private activatedRoute: ActivatedRoute,
  ) { }

  ngOnInit(): void {
    this.authService.user$.pipe(take(1)).subscribe({
      next: (user: User | null) => {
        if (user) {
          this.router.navigateByUrl('/home');
        } else {
          this.activatedRoute.queryParamMap.subscribe({
            next: (params: any) => {
              this.token = params.get('token');
              this.email = params.get('email');
              if (this.token && this.email) {
                this.initializeForm();
              } else {
                this.router.navigateByUrl("/account/login");
              }
            }
          })
        }
      }
    })
  }

  initializeForm() {
    this.passwordForm = this.formBuilder.group({
      newPassword: ['', [Validators.required, Validators.minLength(8), Validators.pattern("(?=.*[a-z])(?=.*[A-Z])(?=.*\\d).{8,}"), Validators.maxLength(12)]]
    })
  }

  resetPassword() {
    this.submitted = true;
    this.errorMessages = {};
    if (this.passwordForm.valid && this.email && this.token) {
      const model: ResetPassword = {
        token: this.token,
        email: this.email,
        newPassword: this.passwordForm.get('newPassword')?.value,
      }

      this.authService.resetPassword(model).subscribe({
        next: (response: any) => {
          this.router.navigateByUrl('/account/login');
        },
        error: (error) => {
          console.log(error);
        }
      });
    }
  }

  isFieldModified(fieldName: string) {
    return this.passwordForm.get(fieldName)!.value !== this.submittedValues[fieldName];
  }

  cancel() {
    this.router.navigateByUrl('/home');
  }
}
