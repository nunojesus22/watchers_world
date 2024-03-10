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
import { LoadingInterceptor } from './interceptors/loading/loading-interceptor.service'
import { EditProfileComponent } from './profile/edit-profile/edit-profile.component';
import { FormsModule } from '@angular/forms';
import { AboutUsComponent } from './about-us/about-us.component';
import { AllMoviesPageComponent } from './media/movies/all-movies-page/all-movies-page.component';
import { MovieApiServiceComponent } from './media/api/movie-api-service/movie-api-service.component';
import { AllSeriesPageComponent } from './media/series/all-series-page/all-series-page.component';
import { MovieDetailsComponent } from './media/movies/movie-details/movie-details.component';
import { SeriesDetailsComponent } from './media/series/series-details/series-details.component';
import { LoadingComponent } from './loader/loading/loading.component';
import { SearchComponent } from './media/search/search.component';
import { SearchServiceComponent } from './media/search-service/search-service.component';
import { AdminComponent } from './admin/admin.component';


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
    AdminComponent,

  ],
  imports: [
    BrowserModule, HttpClientModule,
    AppRoutingModule, FontAwesomeModule, ReactiveFormsModule, FormsModule 
  ],
  providers: [
    { provide: HTTP_INTERCEPTORS, useClass: JwtInterceptor, multi: true },
    { provide: HTTP_INTERCEPTORS, useClass: LoadingInterceptor, multi: true },
    MovieApiServiceComponent,
    MovieApiServiceComponent, SearchServiceComponent

  ],
  bootstrap: [AppComponent]
})
export class AppModule {
  constructor(library: FaIconLibrary) {
    library.addIcons(faGoogle);
  }
}
