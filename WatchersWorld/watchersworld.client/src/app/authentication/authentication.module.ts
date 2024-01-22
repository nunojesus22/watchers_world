import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { AuthenticationRoutingModule } from './authentication-routing/authentication-routing.module';
import { ReactiveFormsModule } from '@angular/forms';
import { LoginComponent } from './login/login.component';
import { RegistrationComponent } from './registration/registration.component';
import { AuthenticationButtonComponent } from './components/authentication-button/authentication-button.component';
import { HttpClientModule } from '@angular/common/http';
import { RecoverPasswordComponent } from './recover-password/recover-password.component';
import { PendingVerificationComponent } from './pending-verification/pending-verification.component';
import { ResendVerificationComponent } from './resend-verification/resend-verification.component';
import { SuspendedAccountComponent } from './suspended-account/suspended-account.component';
import { BlockedAccountComponent } from './blocked-account/blocked-account.component';

@NgModule({
  declarations: [
    AuthenticationButtonComponent,
    LoginComponent,
    RegistrationComponent,
    AuthenticationButtonComponent,
    RecoverPasswordComponent,
    PendingVerificationComponent,
    ResendVerificationComponent,
    BlockedAccountComponent,
    SuspendedAccountComponent,
  ],
  imports: [
    CommonModule,
    AuthenticationRoutingModule,
    ReactiveFormsModule,
    HttpClientModule,
  ],
  exports: [
    ReactiveFormsModule,
    HttpClientModule
  ]
})
export class AuthenticationModule { }
