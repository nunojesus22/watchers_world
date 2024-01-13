import { HttpClientModule } from '@angular/common/http';
import { NgModule } from '@angular/core';
import { BrowserModule } from '@angular/platform-browser';

import { AppRoutingModule } from './app-routing.module';
import { AppComponent } from './app.component';
import { AuthenticationButtonComponent } from './authentication/components/authentication-button/authentication-button.component';
import { LoginComponent } from './authentication/login/login.component';
import { HomeComponent } from './home/home.component';
import { FontAwesomeModule } from '@fortawesome/angular-fontawesome';
import { FaIconLibrary } from '@fortawesome/angular-fontawesome';
import { faGoogle } from '@fortawesome/free-brands-svg-icons';
import { RegistrationComponent } from './authentication/registration/registration.component';
import { PersonalProfileComponent } from './profile/personal-profile/personal-profile.component';


@NgModule({
  declarations: [
    AppComponent,
    AuthenticationButtonComponent,
    LoginComponent,
    HomeComponent,
    RegistrationComponent,
    PersonalProfileComponent
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
