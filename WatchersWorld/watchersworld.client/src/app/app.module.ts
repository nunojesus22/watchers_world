import { HttpClientModule } from '@angular/common/http';
import { NgModule } from '@angular/core';
import { BrowserModule } from '@angular/platform-browser';

import { AppRoutingModule } from './app-routing.module';
import { AppComponent } from './app.component';
import { AuthenticationButtonComponent } from './authentication/components/authentication-button/authentication-button.component';
import { AuthenticationInputComponent } from './authentication/components/authentication-input/authentication-input.component';
import { LoginComponent } from './authentication/login/login.component';
import { HomeComponent } from './home/home.component';

@NgModule({
  declarations: [
    AppComponent,
    AuthenticationButtonComponent,
    AuthenticationInputComponent,
    LoginComponent,
    HomeComponent
  ],
  imports: [
    BrowserModule, HttpClientModule,
    AppRoutingModule
  ],
  providers: [],
  bootstrap: [AppComponent]
})
export class AppModule { }
