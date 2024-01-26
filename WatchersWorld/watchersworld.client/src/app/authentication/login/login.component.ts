import { Component } from '@angular/core';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { Router } from '@angular/router';
import { AuthenticationService } from '../services/authentication.service';

@Component({
  selector: 'app-login',
  templateUrl: './login.component.html',
  styleUrl: './login.component.css'
})
export class LoginComponent {
  loginForm: FormGroup = new FormGroup([]);
  submitted = false;
  errorMessages: any = {};
  submittedValues: any = {};

  constructor(
    private accountService: AuthenticationService,
    private formBuilder: FormBuilder
  ) { }


  ngOnInit(): void {
    this.initializeForm();
  }

  initializeForm() {
    this.loginForm = this.formBuilder.group({
      email: ['', [Validators.required]],
      password: ['', [Validators.required]]
    });
  }

  login() {
    this.submitted = true;
    this.errorMessages = {};
    this.submittedValues = {};

    if (this.loginForm.valid) {
      this.accountService.login(this.loginForm.value).subscribe({
        next: (response) => {
          console.log("Login bem-sucedido");
        },
        error: error => {
          if (error.error.errors) {
            error.error.errors.forEach((value: any) => {
              if (!this.errorMessages[value.field]) { //check if the error with this field already exists
                this.errorMessages[value.field] = value.message;
              }
            });
            this.saveSubmittedValues();
          } else {
            this.errorMessages[error.error.field] = error.error.message;
            this.saveSubmittedValues();
          }
        }
      });
    }
  }

  isFieldModified(fieldName: string): boolean {
    return this.loginForm.get(fieldName)!.value !== this.submittedValues[fieldName];
  }

  private saveSubmittedValues(): void {
    this.submittedValues["email"] = this.loginForm.get("email")!.value;
    this.submittedValues["password"] = this.loginForm.get("password")!.value;
  }
}
