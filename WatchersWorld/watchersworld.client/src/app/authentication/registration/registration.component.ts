import { Component, OnInit } from '@angular/core';
import { AuthenticationService } from '../services/authentication.service';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';

@Component({
  selector: 'app-registration',
  templateUrl: './registration.component.html',
  styleUrls: ['./registration.component.css']
})

export class RegistrationComponent implements OnInit{
  registrationForm: FormGroup = new FormGroup([]);
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
    this.registrationForm = this.formBuilder.group({
      username: ['', [Validators.required, Validators.minLength(4), Validators.maxLength(20)]],
      email: ['', [Validators.required, Validators.pattern("^\\w+@[a-zA-Z_]+?\\.[a-zA-Z]{2,3}$")]],
      password: ['', [Validators.required, Validators.minLength(8), Validators.pattern("(?=.*[a-z])(?=.*[A-Z])(?=.*\\d).{8,}"), Validators.maxLength(12)]]
    });
  }

  register() {
    this.submitted = true;
    this.errorMessages = {};
;

    this.accountService.register(this.registrationForm.value).subscribe({
      next: (response) => {
        console.log("Registro bem-sucedido:");
      },
      error: error => {
        if (error.error.errors) {
          console.log(error.error.errors);
        } else {
          this.errorMessages[error.error.field] = error.error.message;
          this.submittedValues["username"] = this.registrationForm.get("username")!.value;
          this.submittedValues["email"] = this.registrationForm.get("email")!.value;
        }
      }
    });
  }

  isFieldModified(fieldName: string) {
    return this.registrationForm.get(fieldName)!.value !== this.submittedValues[fieldName];
  }
}
