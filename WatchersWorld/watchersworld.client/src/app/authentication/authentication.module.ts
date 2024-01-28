import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { AuthenticationRoutingModule } from './authentication-routing/authentication-routing.module';
import { ReactiveFormsModule } from '@angular/forms';
import { LoginComponent } from './login/login.component';
import { RegistrationComponent } from './registration/registration.component';
import { AuthenticationButtonComponent } from './components/authentication-button/authentication-button.component';
import { HttpClientModule } from '@angular/common/http';
import { PendingVerificationComponent } from './pending-verification/pending-verification.component';
import { SuspendedAccountComponent } from './suspended-account/suspended-account.component';
import { BlockedAccountComponent } from './blocked-account/blocked-account.component';
import { SendEmailComponent } from './send-email/send-email.component';
import { ResetPasswordComponent } from './reset-password/reset-password.component';

@NgModule({
  declarations: [
    AuthenticationButtonComponent,
    LoginComponent,
    RegistrationComponent,
    AuthenticationButtonComponent,
    PendingVerificationComponent,
    BlockedAccountComponent,
    SuspendedAccountComponent,
    SendEmailComponent,
    ResetPasswordComponent,
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
