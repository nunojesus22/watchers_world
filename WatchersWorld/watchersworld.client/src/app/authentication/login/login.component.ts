import { Component, ElementRef, Inject, Renderer2, ViewChild, NgZone } from '@angular/core';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { ActivatedRoute, Route, Router } from '@angular/router';
import { AuthenticationService } from '../services/authentication.service';
import { take } from 'rxjs';
import { User } from '../models/user';
import { CredentialResponse } from 'google-one-tap';
import { LoginWithExternal } from '../models/loginWithExternals';
import { jwtDecode } from 'jwt-decode';
import { DOCUMENT } from '@angular/common';
import { ChatService } from '../../chat/services/chat.service';

@Component({
  selector: 'app-login',
  templateUrl: './login.component.html',
  styleUrl: './login.component.css'
})
export class LoginComponent {
  @ViewChild('googleButton', { static: true }) googleButton: ElementRef = new ElementRef({});
  loginForm: FormGroup = new FormGroup([]);
  submitted = false;
  errorMessages: any = {};
  submittedValues: any = {};
  returnUrl: string | null = null;
  banDurationMessage: string = '';


  constructor(
    private authService: AuthenticationService,
    private formBuilder: FormBuilder,
    private router: Router,
    private activatedRoute: ActivatedRoute,
    private _renderer2: Renderer2,
    private ngZone: NgZone,
    private chatService: ChatService,

    @Inject(DOCUMENT) private _document: Document
  ) {
    this.authService.user$.pipe(take(1)).subscribe({
      next: (user: User | null) => {
        if (user) {
          this.router.navigateByUrl("/home");
        } else {
          this.activatedRoute.queryParamMap.subscribe({
            next: (params: any) => {
              if (params) {
                this.returnUrl = params.get('returnUrl');
              }
            }
          })
        }
      }
    });
  }

  ngOnInit(): void {
    this.initializeGoogleButton();
    this.initializeForm();
  }

  initializeForm() {
    this.loginForm = this.formBuilder.group({
      email: ['', [Validators.required]],
      password: ['', [Validators.required]]
    });
  }
  ngAfterViewInit() {
    const script1 = this._renderer2.createElement('script');
    script1.src = 'https://accounts.google.com/gsi/client';
    script1.async = 'true';
    script1.defer = 'true';
    this._renderer2.appendChild(this._document.body, script1);

  }

  login() {
    this.submitted = true;
    this.errorMessages = {};
    this.submittedValues = {};

    if (this.loginForm.valid) {
      this.authService.login(this.loginForm.value).subscribe({
        next: (response: any) => {
          if (response.message === "A conta está por confirmar!") {
            this.router.navigateByUrl('/account/confirm-email');
          } else if (this.returnUrl) {
            this.router.navigateByUrl(this.returnUrl);
            this.connectChatHub();
          } else {
            this.router.navigateByUrl('/home');
            this.connectChatHub();
          }
        },
        error: (error) => {
          // Handle the banned user case
          if (error.error.Field === "Banned") {
            this.router.navigateByUrl('/suspendedAccount');
            return;
          }

          // Handle other errors
          if (error.error.errors) {
            error.error.errors.forEach((value: any) => {
              if (!this.errorMessages[value.field]) {
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
        { size: 'medium', shape: 'rectangular', text: 'signin_with', logo_alignment: 'center' }
      );
    };
  }

  private async googleCallBack(response: CredentialResponse) {
    this.errorMessages = {};
    this.submittedValues = {};

    if (response.credential) {
      const decodedToken: any = jwtDecode(response.credential);
      this.authService.loginWithThirdParty(new LoginWithExternal(response.credential, decodedToken.sub, "google", decodedToken.email)).subscribe({
        next: _ => {
          this.ngZone.run(() => {
            if (this.returnUrl) {
              this.router.navigateByUrl(this.returnUrl);
              this.connectChatHub();
            } else {
              this.router.navigateByUrl('/');
              this.connectChatHub();
            }
          });
        },
        error: error => {
          this.ngZone.run(() => {
            // Check if the error field indicates the user is banned and handle the message
            if (error.error.field === "Banned") {
              // Here we assume the backend sends a readable ban duration in the response
              //this.banDurationMessage = `A sua conta encontra-se suspensa por ${error.error.BanDuration}.`;
              this.banDurationMessage = `A sua conta encontra-se suspensa.`;
              this.router.navigateByUrl('/suspendedAccount', { state: { banDurationMessage: this.banDurationMessage } });
            } else {
              // Handle other errors by displaying them to the user
              if (error.error.errors) {
                // If there are multiple error messages, process them
                error.error.errors.forEach((value: any) => {
                  this.errorMessages[value.field] = value.message;
                });
              } else {
                // If there's a single error message, display it
                this.errorMessages[error.error.field] = error.error.message;
              }
              this.saveSubmittedValues();
            }
          });
        }
      });
    } else {
      // Handle the case where the Google sign-in response did not include a credential
      this.errorMessages['googleLogin'] = 'Failed to sign in with Google.';
      this.saveSubmittedValues();
    }
  }


  isFieldModified(fieldName: string): boolean {
    return this.loginForm.get(fieldName)!.value !== this.submittedValues[fieldName];
  }

  private saveSubmittedValues(): void {
    this.submittedValues["email"] = this.loginForm.get("email")!.value;
    this.submittedValues["password"] = this.loginForm.get("password")!.value;
  }

  private connectChatHub(): void {
    this.chatService.startConnectionAndListen();
  }

}
