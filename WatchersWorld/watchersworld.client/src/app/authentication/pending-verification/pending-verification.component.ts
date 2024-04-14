import { Component, OnInit } from '@angular/core';
import { AuthenticationService } from '../services/authentication.service';
import { ActivatedRoute, Router } from '@angular/router';
import { take } from 'rxjs';
import { User } from '../models/user';
import { ConfirmEmail } from '../models/confirmEmail';

/**
 * Componente Angular para gerenciar a tela de verificação pendente, onde os usuários são direcionados após tentarem se registrar. 
 * Este componente verifica se o e-mail do usuário foi confirmado e redireciona conforme o resultado da confirmação.
 *
 * @Component Decorador que define a classe como um componente Angular, especificando o seletor, template HTML e arquivo de estilo.
 */
@Component({
  selector: 'app-pending-verification',
  templateUrl: './pending-verification.component.html',
  styleUrl: './pending-verification.component.css'
})
export class PendingVerificationComponent implements OnInit{
  success = true;

  /**
   * Construtor para inicializar dependências.
   *
   * @param authService Serviço de autenticação para realizar operações relacionadas à conta do usuário.
   * @param router Serviço do router para navegação.
   * @param activatedRouter Serviço para acesso aos parâmetros da rota ativa.
   */
  constructor(private authService: AuthenticationService,
    private router: Router,
    private activatedRouter: ActivatedRoute
  ) {}

  /**
   * Inicializa o componente verificando o estado de autenticação do usuário e procedendo com a confirmação de e-mail se necessário.
   */
  ngOnInit(): void {
    this.authService.user$.pipe(take(1)).subscribe({
      next: (user: User | null) => {
        if (user) {
          this.router.navigateByUrl('/home');
        }
        else {
          this.activatedRouter.queryParamMap.subscribe({
            next: (params: any) => {
              const confirmEmail: ConfirmEmail = {
                token: params.get('token'),
                email: params.get('email')
              }

              if (confirmEmail.email == undefined || confirmEmail.token == undefined) {
                this.success = false;
              }
              else {
                this.authService.confirmEmail(confirmEmail).subscribe({
                  next: (response: any) => {
                    this.router.navigateByUrl('/account/login');
                  },
                  error: (error) => {
                    console.log(error);
                    this.success = false;
                  }
                });
              }
            },
            error: error => {
              console.log(error);
              this.success = false;
            }
          })
        }
      }
    })
  }

  /**
  * Redireciona para a página de reenvio de link de confirmação de e-mail.
  */
  resendEmailConfirmationLink() {
    this.router.navigateByUrl('/account/send-email/resend-email-confirmation-link');
  }

  /**
   * Redireciona para a página de login.
   */
  login() {
    this.router.navigateByUrl('/account/login');
  }
}
