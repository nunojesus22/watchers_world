import { NgModule } from '@angular/core';
import { RouterModule, Routes } from '@angular/router';
import { RegistrationComponent } from './authentication/registration/registration.component';
import { RecoverPasswordComponent } from './authentication/recover-password/recover-password.component';
import { LoginComponent } from './authentication/login/login.component';
import { HomeComponent } from './home/home.component';

const routes: Routes = [
  // ... outras rotas
  { path: 'login', component: LoginComponent},
  { path: '', redirectTo: '/login', pathMatch: 'full' },
  { path: 'register', component: RegistrationComponent },
  { path: 'recover-password', component: RecoverPasswordComponent },
  { path: 'home', component: HomeComponent}
];

@NgModule({
  imports: [RouterModule.forRoot(routes)],
  exports: [RouterModule]
})

export class AppRoutingModule { }
