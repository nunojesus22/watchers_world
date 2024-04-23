import { HTTP_INTERCEPTORS, HttpClientModule } from '@angular/common/http';
import { NgModule } from '@angular/core';
import { BrowserModule } from '@angular/platform-browser';
import { BrowserAnimationsModule } from '@angular/platform-browser/animations';

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
import { SeasonDetailsComponent } from './season-details/season-details.component';
import { SeasonDetailsInfoComponent } from './season-details-info/season-details-info.component';
import { ChatComponent } from './chat/chat.component';
import { StatisticsComponent } from './statistics/statistics.component';
import { NotificationsComponent } from './notifications/notifications/notifications.component';
import { GamificationComponent } from './gamification/gamification.component';
import { ChatService } from './chat/services/chat.service';
import { AdminStatisticsComponent } from './admin-statistics/admin-statistics.component';
import { MatDialogModule } from '@angular/material/dialog';
import { ConfirmDialogComponent } from './confirm-dialog/confirm-dialog.component';
import { DialogService } from './confirm-dialog/services/dialog.service';
import { ConfirmBoxConfigModule, DialogConfigModule, NgxAwesomePopupModule, ToastNotificationConfigModule } from '@costlydeveloper/ngx-awesome-popup';
import { ToastModule } from 'primeng/toast'
import { MessageService } from 'primeng/api'



import { HighchartsChartModule } from 'highcharts-angular';
import { TermsAndConditionsComponent } from './terms-and-conditions/terms-and-conditions.component';
import { SearchUsersComponent } from './search-users/search-users.component';
import { ModerationComponent } from './moderation/moderation.component';


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
    SeasonDetailsComponent,
    SeasonDetailsInfoComponent,
    NotificationsComponent,
    ChatComponent,
    StatisticsComponent,
    GamificationComponent,
    AdminStatisticsComponent,
    ConfirmDialogComponent,
    TermsAndConditionsComponent,
    SearchUsersComponent,
    ModerationComponent,
  ],
  imports: [
    BrowserModule,
    BrowserAnimationsModule,
    ToastModule,
    HttpClientModule,
    AppRoutingModule, FontAwesomeModule, ReactiveFormsModule, FormsModule, MatDialogModule,
    NgxAwesomePopupModule.forRoot({
      colorList: {
        success: '#3caea3', 
        info: '#2f8ee5', 
        warning: '#ffc107', 
        danger: '#e46464', 
        customOne: '#3ebb1a',
        customTwo: '#bd47fa',
      },
    }),
    ConfirmBoxConfigModule.forRoot(),

    DialogConfigModule.forRoot(), 
    ToastNotificationConfigModule.forRoot(),
    AppRoutingModule, FontAwesomeModule, ReactiveFormsModule, FormsModule
    , HighchartsChartModule

  ],
  providers: [
    { provide: HTTP_INTERCEPTORS, useClass: JwtInterceptor, multi: true },
    { provide: HTTP_INTERCEPTORS, useClass: LoadingInterceptor, multi: true },
    MovieApiServiceComponent,
    MovieApiServiceComponent,
    SearchServiceComponent,
    ChatService,
    DialogService,
    MessageService,
  ],
  bootstrap: [AppComponent]
})
export class AppModule {
  constructor(library: FaIconLibrary) {
    library.addIcons(faGoogle);
  }
}
