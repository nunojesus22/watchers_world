import { NgModule } from '@angular/core';
import { RouterModule, Routes } from '@angular/router';
import { LoginComponent } from './authentication/login/login.component';
import { RegistrationComponent } from './authentication/registration/registration.component';
import { RecoverPasswordComponent } from './authentication/recover-password/recover-password.component';
import { ResendVerificationComponent } from './authentication/resend-verification/resend-verification.component';
import { BlockedAccountComponent } from './authentication/blocked-account/blocked-account.component';
import { PendingVerificationComponent } from './authentication/pending-verification/pending-verification.component';
import { ReactiveFormsModule } from '@angular/forms';

const routes: Routes = [
  { path: '', component: RegistrationComponent},
  { path: 'account', loadChildren: () => import('./authentication/authentication.module').then(module => module.AuthenticationModule)}
];

@NgModule({
  imports: [RouterModule.forRoot(routes), ReactiveFormsModule],
  exports: [RouterModule]
})

export class AppRoutingModule { }
