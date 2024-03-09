import { HTTP_INTERCEPTORS, HttpClientModule } from '@angular/common/http';
import { NgModule } from '@angular/core';
import { BrowserModule } from '@angular/platform-browser';
import { MatDialogModule } from '@angular/material/dialog';

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
import { LoadingInterceptor } from './interceptors/loading/loading-interceptor.service'
import { EditProfileComponent } from './profile/edit-profile/edit-profile.component';
import { FormsModule } from '@angular/forms';
import { AboutUsComponent } from './about-us/about-us.component';
import { AllMoviesPageComponent } from './all-movies-page/all-movies-page.component';
import { MovieApiServiceComponent } from './movie-api-service/movie-api-service.component';
import { AllSeriesPageComponent } from './all-series-page/all-series-page.component';
import { MovieDetailsComponent } from './movie-details/movie-details.component';
import { SeriesDetailsComponent } from './series-details/series-details.component';
import { LoadingComponent } from './loader/loading/loading.component';
import { SearchComponent } from './search/search.component';
import { SearchServiceComponent } from './search-service/search-service.component';
import { QuizComponent } from './quiz/quiz.component';
import { provideAnimationsAsync } from '@angular/platform-browser/animations/async';


@NgModule({
  declarations: [
    AppComponent,
    HomeComponent,
    NavMenuComponent,
    FooterComponent,
    ProfileComponent,
    EditProfileComponent,
    AboutUsComponent,
    AllMoviesPageComponent,
    AllSeriesPageComponent,
    MovieDetailsComponent,
    SeriesDetailsComponent,
    LoadingComponent,
    SearchComponent,
    SearchServiceComponent,
    QuizComponent,

  ],
  imports: [
    BrowserModule, HttpClientModule,
    AppRoutingModule, FontAwesomeModule, ReactiveFormsModule, FormsModule,
    MatDialogModule
  ],
  providers: [
    { provide: HTTP_INTERCEPTORS, useClass: JwtInterceptor, multi: true },
    { provide: HTTP_INTERCEPTORS, useClass: LoadingInterceptor, multi: true },
    MovieApiServiceComponent,
    MovieApiServiceComponent, SearchServiceComponent, provideAnimationsAsync('noop')

  ],
  bootstrap: [AppComponent]
})
export class AppModule {
  constructor(library: FaIconLibrary) {
    library.addIcons(faGoogle);
  }
}
