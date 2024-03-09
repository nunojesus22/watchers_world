import { NgModule } from '@angular/core';
import { RouterModule, Routes } from '@angular/router';
import { ReactiveFormsModule } from '@angular/forms';
import { HomeComponent } from './home/home.component';
import { ProfileComponent } from './profile/profile/profile.component';
import { AuthorizationGuard } from './guards/authorization.guard';
import { EditProfileComponent } from './profile/edit-profile/edit-profile.component';
import { AboutUsComponent } from './about-us/about-us.component';
import { AllMoviesPageComponent } from './all-movies-page/all-movies-page.component';
import { AllSeriesPageComponent } from './all-series-page/all-series-page.component';
import { MovieDetailsComponent } from './movie-details/movie-details.component';
import { SeriesDetailsComponent } from './series-details/series-details.component';
import { SearchComponent } from './search/search.component';

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

  { path: 'search', component: SearchComponent },
  { path: 'search/:searchTerm', component: SearchComponent }, // Adiciona esse novo caminho para a pesquisa com o parâmetro searchTerm


];

@NgModule({
  imports: [RouterModule.forRoot(routes), ReactiveFormsModule],
  exports: [RouterModule]
})

export class AppRoutingModule { }
