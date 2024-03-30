import { NgModule } from '@angular/core';
import { RouterModule, Routes } from '@angular/router';
import { ReactiveFormsModule } from '@angular/forms';
import { HomeComponent } from './home/home.component';
import { ProfileComponent } from './profile/profile/profile.component';
import { AuthorizationGuard } from './guards/authorization.guard';
import { EditProfileComponent } from './profile/edit-profile/edit-profile.component';
import { AboutUsComponent } from './about-us/about-us.component';
import { AllMoviesPageComponent } from './media/movies/all-movies-page/all-movies-page.component';
import { AllSeriesPageComponent } from './media/series/all-series-page/all-series-page.component';
import { MovieDetailsComponent } from './media/movies/movie-details/movie-details.component';
import { SeriesDetailsComponent } from './media/series/series-details/series-details.component';
import { SearchComponent } from './media/search/search.component';
import { AdminComponent } from './admin/admin.component';
import { SeasonDetailsComponent } from './season-details/season-details.component';
import { SeasonDetailsInfoComponent } from './season-details-info/season-details-info.component';
import { SuspendedAccountComponent } from './authentication/suspended-account/suspended-account.component';
import { ChatComponent } from './chat/chat.component';
import { StatisticsComponent } from './statistics/statistics.component';
import { NotificationsComponent } from './notifications/notifications/notifications.component';
import { GamificationComponent } from './gamification/gamification.component';

const routes: Routes = [
  { path: '', redirectTo: '/home', pathMatch: 'full' },
  {
    path: '',
    runGuardsAndResolvers: 'always',
    canActivate: [AuthorizationGuard],
    children: [
      { path: 'profile', component: ProfileComponent }
    ]
  },
  { path: 'home', component: HomeComponent },
  { path: 'profile/:username', component: ProfileComponent },
  { path: 'editProfile/:username', component: EditProfileComponent },
  { path: 'account', loadChildren: () => import('./authentication/authentication.module').then(module => module.AuthenticationModule) },
  { path: 'about-us', component: AboutUsComponent },
  { path: 'all-movies-page', component: AllMoviesPageComponent },
  { path: 'all-series-page', component: AllSeriesPageComponent },
  { path: 'movie/:id', component: MovieDetailsComponent },
  { path: 'serie/:id', component: SeriesDetailsComponent },
  { path: 'admin', component: AdminComponent },
  { path: 'notifications/:username', component: NotificationsComponent },
  { path: 'suspendedAccount', component: SuspendedAccountComponent },
  { path: 'chat/:myUsername', component: ChatComponent }, 
  { path: 'chat/:myUsername/:otherUsername', component: ChatComponent },
  { path: 'gamification/:username', component: GamificationComponent }, 
  { path: 'search', component: SearchComponent },
  { path: 'search/:searchTerm', component: SearchComponent },
  { path: 'serie/:id/season', component: SeasonDetailsComponent },
  { path: 'serie/:id/season/:seasonNumber', component: SeasonDetailsInfoComponent },
  { path: 'statistics/:username', component: StatisticsComponent },
  
];

@NgModule({
  imports: [RouterModule.forRoot(routes, {useHash: false}), ReactiveFormsModule],
  exports: [RouterModule]
})

export class AppRoutingModule { }
