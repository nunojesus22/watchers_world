import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule, Routes } from '@angular/router';
import { RegistrationComponent } from '../registration/registration.component';
import { LoginComponent } from '../login/login.component';
import { PendingVerificationComponent } from '../pending-verification/pending-verification.component';
import { SendEmailComponent } from '../send-email/send-email.component';
import { ResetPasswordComponent } from '../reset-password/reset-password.component';
import { RegisterWithThirdPartyComponent } from '../register-with-third-party/register-with-third-party.component';
import { PageNotFoundComponent } from '../../page-not-found/page-not-found.component';

const routes: Routes = [
  { path: 'register', component: RegistrationComponent },
  { path: 'login', component: LoginComponent },
  { path: 'confirm-email', component: PendingVerificationComponent },
  { path: 'send-email/:mode', component: SendEmailComponent },
  { path: 'reset-password', component: ResetPasswordComponent },
  { path: 'register/third-party/:provider', component: RegisterWithThirdPartyComponent },
];


@NgModule({
  declarations: [],
  imports: [
    CommonModule,
    RouterModule.forChild(routes)
  ],
  exports: [
    RouterModule
  ]
})
export class AuthenticationRoutingModule { }
