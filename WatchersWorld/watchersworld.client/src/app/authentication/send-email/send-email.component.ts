import { Component, OnInit } from '@angular/core';
import { AuthenticationService } from '../services/authentication.service';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { ActivatedRoute, Router } from '@angular/router';
import { User } from '../models/user';
import { take } from 'rxjs';

@Component({
  selector: 'app-send-email',
  templateUrl: './send-email.component.html',
  styleUrl: './send-email.component.css'
})
export class SendEmailComponent implements OnInit{
  emailForm: FormGroup = new FormGroup({});
  submitted = false;
  mode: string | undefined;
  errorMessages: any = {};
  submittedValues: any = {};
  emailValue: string = "";


  constructor(private authService: AuthenticationService,
    private formBuilder: FormBuilder,
    private router: Router,
    private activatedRoute : ActivatedRoute,
  ) {}

  ngOnInit(): void {
    this.authService.user$.pipe(take(1)).subscribe({
      next: (user: User | null) => {
        if (user) {
          this.router.navigateByUrl('/home');
        } else {
          const mode = this.activatedRoute.snapshot.paramMap.get('mode');
          if (mode) {
            this.mode = mode;
            this.initializeForm();
          }
        }
      }
    })
  }

  initializeForm() {
    this.emailForm = this.formBuilder.group({
      email: ['', [Validators.required, Validators.email]],
    })
  }

  sendEmail() {
    this.submitted = true;
    this.errorMessages = [];

    if (this.emailForm.valid && this.mode) {
      this.emailValue = this.emailForm.get('email')?.value;
      if (this.mode.includes('resend-email-confirmation-link')) {
        this.authService.resendEmailConfirmationLink(this.emailValue).subscribe({
          next: (response: any) => {
            this.router.navigateByUrl('/account/login');
          },
          error: error => {
            if (error.error) {
              this.errorMessages[error.error.field] = error.error.message;
              this.saveSubmittedValues();
            }
          }
        });
      } else if (this.mode.includes('forgot-password')) {
        this.authService.forgotPassword(this.emailValue).subscribe({
          next: (response: any) => {
            this.router.navigateByUrl('/account/login');
          },
          error: error => {
            if (error.error) {
              this.errorMessages[error.error.field] = error.error.message;
              this.saveSubmittedValues();
            }
          }
        });
      }
    }
  }

  isFieldModified(fieldName: string) {
    return this.emailForm.get(fieldName)!.value !== this.submittedValues[fieldName];
  }

  private saveSubmittedValues(): void {
    this.submittedValues["email"] = this.emailValue;
  }

  cancel() {
    this.router.navigateByUrl('/home');
  }
}
