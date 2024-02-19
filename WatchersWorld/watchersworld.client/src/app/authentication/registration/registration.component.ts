import { Component, ElementRef, Inject, OnInit, Renderer2, ViewChild } from '@angular/core';
import { AuthenticationService } from '../services/authentication.service';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { Router } from '@angular/router';
import { User } from '../models/user';
import { take } from 'rxjs';
import { DOCUMENT } from '@angular/common';
import { CredentialResponse } from 'google-one-tap';
import { jwtDecode } from 'jwt-decode';

@Component({
  selector: 'app-registration',
  templateUrl: './registration.component.html',
  styleUrls: ['./registration.component.css']
})

export class RegistrationComponent implements OnInit{
  @ViewChild('googleButton', { static: true }) googleButton: ElementRef = new ElementRef({});
  registrationForm: FormGroup = new FormGroup([]);
  submitted = false;
  errorMessages: any = {};
  submittedValues: any = {};

  constructor(
    private authService: AuthenticationService,
    private formBuilder: FormBuilder,
    private router: Router,
    private _renderer2: Renderer2,
    @Inject(DOCUMENT) private _document: Document
  ) {
    this.authService.user$.pipe(take(1)).subscribe({
      next: (user: User | null) => {
        if (user) {
          this.router.navigateByUrl("/home");
        }
      }
    });
  }


  ngOnInit(): void {
    this.initializeGoogleButton();
    this.initializeForm();
  }

    ngAfterViewInit() {
    const script1 = this._renderer2.createElement('script');
    script1.src = 'https://accounts.google.com/gsi/client';
    script1.async = 'true';
    script1.defer = 'true';
    this._renderer2.appendChild(this._document.body, script1);

  }

  initializeForm() {
    this.registrationForm = this.formBuilder.group({
      username: ['', [Validators.required, Validators.minLength(4), Validators.maxLength(20)]],
      email: ['', [Validators.required, Validators.email]],
      password: ['', [Validators.required, Validators.minLength(8), Validators.pattern("(?=.*[a-z])(?=.*[A-Z])(?=.*\\d).{8,}"), Validators.maxLength(12)]]
    });
  }

  register() {
    this.submitted = true;
    this.errorMessages = {};
    this.submittedValues = {};
;
    if (this.registrationForm.valid) {
      this.authService.register(this.registrationForm.value).subscribe({
        next: (response) => {
          console.log("Registro bem-sucedido");
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

  isFieldModified(fieldName: string) {
    return this.registrationForm.get(fieldName)!.value !== this.submittedValues[fieldName];
  }

  private saveSubmittedValues(): void {
    this.submittedValues["username"] = this.registrationForm.get("username")!.value;
    this.submittedValues["email"] = this.registrationForm.get("email")!.value;
  }


  private initializeGoogleButton() {
    (window as any).onGoogleLibraryLoad = () => {
      //@ts-ignore
      google.accounts.id.initialize({
        client_id: '290666772375-5s2b58vflc2ohpc01f7q1hguo9k5gpi7.apps.googleusercontent.com',
        callback: this.googleCallBack.bind(this),
        auto_select: false,
        cancel_on_tap_outside: true
      });
      //@ts-ignore
      google.accounts.id.renderButton(
        this.googleButton.nativeElement,
        { size: 'medium', shape: 'rectangular', text: 'signup_with', logo_alignment: 'center' }
      );
    };
  }
  private async googleCallBack(response: CredentialResponse) {
    const decodedToken: any = jwtDecode(response.credential);
    this.router.navigateByUrl(`/account/register/third-party/google?access_token=${response.credential}&userId=${decodedToken.sub}&email=${decodedToken.email}`);
  }

}
