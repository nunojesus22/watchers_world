import { Component } from '@angular/core';
import { Router } from '@angular/router';

@Component({
  selector: 'app-home',
  templateUrl: './home.component.html',
  styleUrls: ['./home.component.css']
})
export class HomeComponent {

  constructor(private router: Router) { }

  logout() {
    // A lógica para terminar a sessão aqui
    // ...

    // Redireciona para a página de registro e substitui a entrada atual no histórico de navegação
    this.router.navigateByUrl('/account/register', { replaceUrl: true });
  }
}
