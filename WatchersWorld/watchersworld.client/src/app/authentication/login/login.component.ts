import { Component } from '@angular/core';
import { Router } from '@angular/router';

@Component({
  selector: 'app-login',
  templateUrl: './login.component.html',
  styleUrl: './login.component.css'
})
export class LoginComponent {
  constructor(private router: Router) { }

  login() {
    // Código para o login...
    // Se o login for bem-sucedido, redirecione para outra rota.
    this.router.navigate(['/home']);
  }
}
