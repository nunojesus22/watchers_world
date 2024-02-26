import { NgModule } from '@angular/core';
import { RouterModule, Routes } from '@angular/router';
import { ReactiveFormsModule } from '@angular/forms';
import { HomeComponent } from './home/home.component';
import { ProfileComponent } from './profile/profile/profile.component';
import { AuthorizationGuard } from './guards/authorization.guard';
import { AboutUsComponent } from './about-us/about-us.component';
import { AllMoviesPageComponent } from './all-movies-page/all-movies-page.component';
import { MoviePageComponent } from './movie-page/movie-page.component';
import { AllSeriesPageComponent } from './all-series-page/all-series-page.component';

const routes: Routes = [
  { path: '', redirectTo: '/home', pathMatch: 'full' },
  {
    path: '',
    runGuardsAndResolvers: 'always',
    canActivate: [AuthorizationGuard],
    children: [
      {path: 'profile', component: ProfileComponent}
    ]
  },
  { path: 'home', component: HomeComponent },
  { path: 'profile', component: ProfileComponent },
  { path: 'account', loadChildren: () => import('./authentication/authentication.module').then(module => module.AuthenticationModule)},
  { path: 'about-us', component: AboutUsComponent },
  { path: 'all-movies-page', component: AllMoviesPageComponent },
  { path: 'all-series-page', component: AllSeriesPageComponent},
  { path: 'movie-page', component: MoviePageComponent},


];

@NgModule({
  imports: [RouterModule.forRoot(routes), ReactiveFormsModule],
  exports: [RouterModule]
})

export class AppRoutingModule { }
