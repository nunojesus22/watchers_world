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
import { AdminStatisticsComponent } from './admin-statistics/admin-statistics.component';
import { TermsAndConditionsComponent } from './terms-and-conditions/terms-and-conditions.component';
import { SearchUsersComponent } from './search-users/search-users.component';
import { ModerationComponent } from './moderation/moderation.component';
import { PageNotFoundComponent } from './page-not-found/page-not-found.component';
import { ProfileFavoritesComponent } from './profile-favorites/profile-favorites.component';
import { ProfileFollowersComponent } from './profile-followers/profile-followers.component';
import { ProfileFollowingComponent } from './profile-following/profile-following.component';
import { ProfileMoviesWatchedComponent } from './profile-movies-watched/profile-movies-watched.component';
import { ProfileMoviesToWatchLaterComponent } from './profile-movies-to-watch-later/profile-movies-to-watch-later.component';
import { ProfileSeriesWatchedComponent } from './profile-series-watched/profile-series-watched.component';
import { ProfileSeriesToWatchLaterComponent } from './profile-series-to-watch-later/profile-series-to-watch-later.component';

const routes: Routes = [
  { path: '', redirectTo: '/home', pathMatch: 'full' },
  {
    path: '',
    runGuardsAndResolvers: 'always',
    canActivate: [AuthorizationGuard],
    children: [
      { path: 'profile', component: ProfileComponent },
    ]
  },
  { path: 'home', component: HomeComponent },
  { path: 'profile/:username', component: ProfileComponent },
  { path: 'profile/:username/followers', component: ProfileFollowersComponent },
  { path: 'profile/:username/following', component: ProfileFollowingComponent },
  { path: 'profile/:username/favorites', component: ProfileFavoritesComponent },
  { path: 'profile/:username/watched-movies', component: ProfileMoviesWatchedComponent },
  { path: 'profile/:username/to-watch-movies', component: ProfileMoviesToWatchLaterComponent },
  { path: 'profile/:username/watched-series', component: ProfileSeriesWatchedComponent },
  { path: 'profile/:username/to-watch-series', component: ProfileSeriesToWatchLaterComponent },
  {
    path: 'editProfile/:username',
    component: EditProfileComponent,
    canActivate: [AuthorizationGuard]
  },
  { path: 'account', loadChildren: () => import('./authentication/authentication.module').then(module => module.AuthenticationModule) },
  { path: 'about-us', component: AboutUsComponent },
  { path: 'all-movies-page', component: AllMoviesPageComponent },
  { path: 'all-series-page', component: AllSeriesPageComponent },
  { path: 'movie/:id', component: MovieDetailsComponent },
  { path: 'serie/:id', component: SeriesDetailsComponent },
  {
    path: 'admin',
    component: AdminComponent,
    canActivate: [AuthorizationGuard]
  },
  {
    path: 'notifications/:username',
    component: NotificationsComponent,
    canActivate: [AuthorizationGuard]
  },
  { path: 'suspendedAccount', component: SuspendedAccountComponent },
  { path: 'chat', component: ChatComponent },
  { path: 'chat/:username', component: ChatComponent },
  { path: 'gamification/:username', component: GamificationComponent }, 
  { path: 'search', component: SearchComponent },
  { path: 'search/:searchTerm', component: SearchComponent },
  { path: 'serie/:id/season', component: SeasonDetailsComponent },
  { path: 'serie/:id/season/:seasonNumber', component: SeasonDetailsInfoComponent },
  {
    path: 'statistics/:username',
    component: StatisticsComponent,
    canActivate: [AuthorizationGuard]
  },
  {
    path: 'admin-statistics',
    component: AdminStatisticsComponent,
    canActivate: [AuthorizationGuard]
  },
  { path: 'terms-and-conditions', component: TermsAndConditionsComponent },
  { path: 'search-users', component: SearchUsersComponent },
  {
    path: 'moderation/:username',
    component: ModerationComponent,
    canActivate: [AuthorizationGuard]
  },
  { path: 'page-not-found', component: PageNotFoundComponent },
  { path: '**', redirectTo: '/page-not-found', pathMatch: 'full' },
];

@NgModule({
  imports: [RouterModule.forRoot(routes, {useHash: false}), ReactiveFormsModule],
  exports: [RouterModule]
})

export class AppRoutingModule { }
