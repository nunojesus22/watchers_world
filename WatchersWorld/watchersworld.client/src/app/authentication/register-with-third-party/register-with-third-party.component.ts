import { Component, OnInit } from '@angular/core';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { ActivatedRoute, Router } from '@angular/router';
import { AuthenticationService } from '../services/authentication.service';
import { take } from 'rxjs';
import { User } from '../models/user';
import { RegisterWithExternal } from '../models/registerWithExternal';

@Component({
  selector: 'app-register-with-third-party',
  templateUrl: './register-with-third-party.component.html',
  styleUrl: './register-with-third-party.component.css'
})
export class RegisterWithThirdPartyComponent implements OnInit {

  registerForm: FormGroup = new FormGroup({});

  submitted = false;
  provider: string | null = null;
  access_token: string | null = null;
  userId: string | null = null;
  email: string | null = null;

  errorMessages: any = {};
  submittedValues: any = {};

  constructor(private accountService: AuthenticationService,
    private router: Router,
    private activatedRoute: ActivatedRoute,
    private formBuilder: FormBuilder) { }

  ngOnInit(): void {
    this.accountService.user$.pipe(take(1)).subscribe({
      next: (user: User | null) => {
        if (user) {
          this.router.navigateByUrl('/');

        } else {
          this.activatedRoute.queryParamMap.subscribe({
            next: (params: any) => {
              this.provider = this.activatedRoute.snapshot.paramMap.get('provider');
              this.access_token = params.get('access_token');
              this.userId = params.get('userId');
              this.email = params.get('email');

              console.log(this.provider);
              console.log(this.access_token);
              console.log(this.userId);
              console.log("ola", this.email);

              if (this.provider && this.access_token && this.userId && this.email && (this.provider === 'google')) {

                this.initializeForm();

              } else {

                this.router.navigateByUrl('/account/register');
              }
            }
          });



        }
      }
    });

  }
  initializeForm() {
    this.registerForm = this.formBuilder.group({
      username: ['', [Validators.required, Validators.minLength(4), Validators.maxLength(20)]],
    });

  }

  register() {
    this.submitted = true;
    this.errorMessages = [];

    if (this.registerForm.valid && this.userId && this.access_token && this.provider && this.email) {
      const userName = this.registerForm.get('username')?.value;
      const model = new RegisterWithExternal(userName, this.userId, this.access_token, this.provider, this.email)
      console.log(model);
      this.accountService.registerWithThirdParty(model).subscribe({
        next: _ => {
          this.router.navigateByUrl('/')
          console.log(_);
        }

        ,
        error: error => {
          if (error.error.errors) {
            error.error.errors.forEach((value: any) => {
              if (!this.errorMessages[value.field]) { //check if the error with this field already exists
                this.errorMessages[value.field] = value.message;
                //console.log(error.error);
              }
            });
            this.saveSubmittedValues();
          } else {
            this.errorMessages[error.error.field] = error.error;
            console.log(error.error);

            this.saveSubmittedValues();
          }
        }
      });
    }

  }
  isFieldModified(fieldName: string) {
    return this.registerForm.get(fieldName)!.value !== this.submittedValues[fieldName];
  }
  private saveSubmittedValues(): void {
    this.submittedValues["username"] = this.registerForm.get("username")!.value;

  }

}

