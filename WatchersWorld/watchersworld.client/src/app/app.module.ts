import { HTTP_INTERCEPTORS, HttpClientModule } from '@angular/common/http';
import { NgModule } from '@angular/core';
import { BrowserModule } from '@angular/platform-browser';

import { AppRoutingModule } from './app-routing.module';
import { AppComponent } from './app.component';
import { FontAwesomeModule } from '@fortawesome/angular-fontawesome';
import { FaIconLibrary } from '@fortawesome/angular-fontawesome';
import { faGoogle } from '@fortawesome/free-brands-svg-icons';
import { HomeComponent } from './home/home.component';
import { NavMenuComponent } from './nav-menu/nav-menu.component';
import { FooterComponent } from './footer/footer.component';
import { ReactiveFormsModule } from '@angular/forms';
import { ProfileComponent } from './profile/profile/profile.component';
import { JwtInterceptor } from './interceptors/jwt.interceptor';
import { AboutUsComponent } from './about-us/about-us.component';
import { MoviePageComponent } from './movie-page/movie-page.component';
import { AllMoviesPageComponent } from './all-movies-page/all-movies-page.component';
import { MovieApiServiceComponent } from './movie-api-service/movie-api-service.component';
import { AllSeriesPageComponent } from './all-series-page/all-series-page.component';



@NgModule({
  declarations: [
    AppComponent,
    HomeComponent,
    NavMenuComponent,
    FooterComponent,
    ProfileComponent,
    AboutUsComponent,
    MoviePageComponent,
    AllMoviesPageComponent,
    AllSeriesPageComponent,

  ],
  imports: [
    BrowserModule, HttpClientModule,
    AppRoutingModule, FontAwesomeModule, ReactiveFormsModule
  ],
  providers: [
    { provide: HTTP_INTERCEPTORS, useClass: JwtInterceptor, multi: true },
    MovieApiServiceComponent,

  ],
  bootstrap: [AppComponent]
})
export class AppModule {
  constructor(library: FaIconLibrary) {
    library.addIcons(faGoogle);
  }
}
