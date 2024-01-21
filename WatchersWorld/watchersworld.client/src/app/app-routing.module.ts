import { NgModule } from '@angular/core';
import { RouterModule, Routes } from '@angular/router';
import { RegistrationComponent } from './authentication/registration/registration.component';
import { RecoverPasswordComponent } from './authentication/recover-password/recover-password.component';

const routes: Routes = [
  // ... outras rotas
  { path: 'register', component: RegistrationComponent },
  { path: 'recover-password', component: RecoverPasswordComponent}
];

@NgModule({
  imports: [RouterModule.forRoot(routes)],
  exports: [RouterModule]
})

export class AppRoutingModule { }
