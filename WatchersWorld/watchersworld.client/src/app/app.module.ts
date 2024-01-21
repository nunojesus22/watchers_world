import { HttpClientModule } from '@angular/common/http';
import { NgModule } from '@angular/core';
import { BrowserModule } from '@angular/platform-browser';

import { AppRoutingModule } from './app-routing.module';
import { AppComponent } from './app.component';
import { AuthenticationButtonComponent } from './authentication/components/authentication-button/authentication-button.component';
import { LoginComponent } from './authentication/login/login.component';
import { FontAwesomeModule } from '@fortawesome/angular-fontawesome';
import { FaIconLibrary } from '@fortawesome/angular-fontawesome';
import { faGoogle } from '@fortawesome/free-brands-svg-icons';
import { RegistrationComponent } from './authentication/registration/registration.component';
import { RecoverPasswordComponent } from './authentication/recover-password/recover-password.component';
import { PendingVerificationComponent } from './authentication/pending-verification/pending-verification.component';
import { ResendVerificationComponent } from './authentication/resend-verification/resend-verification.component';
import { BlockedAccountComponent } from './authentication/blocked-account/blocked-account.component';
import { SuspendedAccountComponent } from './authentication/suspended-account/suspended-account.component';
import { HomeComponent } from './home/home.component';
import { NavMenuComponent } from './nav-menu/nav-menu.component';
import { FooterComponent } from './footer/footer.component';



@NgModule({
  declarations: [
    AppComponent,
    AuthenticationButtonComponent,
    LoginComponent,
    RegistrationComponent,
    RecoverPasswordComponent,
    PendingVerificationComponent,
    ResendVerificationComponent,
    BlockedAccountComponent,
    SuspendedAccountComponent,
    HomeComponent,
    NavMenuComponent,
    FooterComponent
  ],
  imports: [
    BrowserModule, HttpClientModule,
    AppRoutingModule, FontAwesomeModule
  ],
  providers: [],
  bootstrap: [AppComponent]
})
export class AppModule {
  constructor(library: FaIconLibrary) {
    library.addIcons(faGoogle);
  }
}
