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
    ;
    if (this.loginForm.valid) {
      this.accountService.login(this.loginForm.value).subscribe({
        next: (response) => {
          console.log("Login bem-sucedido:");
        },
        error: error => {
          if (error.error.errors) {
            console.log(error.error.errors);
          } else {
            this.errorMessages[error.error.field] = error.error.message;
            this.submittedValues["email"] = this.loginForm.get("email")!.value;
            this.submittedValues["password"] = this.loginForm.get("password")!.value;
          }
        }
      });
    }
  }

  isFieldModified(fieldName: string) {
    return this.loginForm.get(fieldName)!.value !== this.submittedValues[fieldName];
  }
}
