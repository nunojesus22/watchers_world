import { Component, OnInit } from '@angular/core';
import { AuthenticationService } from '../services/authentication.service';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { ActivatedRoute, Router } from '@angular/router';
import { User } from '../models/user';
import { take } from 'rxjs';

/**
 * Componente responsável por enviar e-mails de confirmação de conta ou recuperação de senha.
 *
 * @Component Decorador que define a classe como um componente Angular, especificando o seletor, template HTML e arquivo de estilo.
 */
@Component({
  selector: 'app-send-email',
  templateUrl: './send-email.component.html',
  styleUrl: './send-email.component.css'
})
export class SendEmailComponent implements OnInit{
  emailForm: FormGroup = new FormGroup({});
  submitted = false;
  mode: string | undefined;
  errorMessages: any = {};
  submittedValues: any = {};
  emailValue: string = "";


  /**
   * Construtor para inicializar dependências.
   *
   * @param authService Serviço de autenticação para gerenciar ações relacionadas a e-mails.
   * @param formBuilder Construtor de formulários para criação de formulários reativos.
   * @param router Serviço do router para navegação.
   * @param activatedRoute Serviço para acesso aos parâmetros da rota ativa.
   */
  constructor(private authService: AuthenticationService,
    private formBuilder: FormBuilder,
    private router: Router,
    private activatedRoute : ActivatedRoute,
  ) {}

  /**
   * Inicializa o componente configurando o formulário e determinando o modo de operação a partir dos parâmetros da rota.
   */
  ngOnInit(): void {
    this.authService.user$.pipe(take(1)).subscribe({
      next: (user: User | null) => {
        if (user) {
          this.router.navigateByUrl('/home');
        } else {
          const mode = this.activatedRoute.snapshot.paramMap.get('mode');
          if (mode) {
            this.mode = mode;
            this.initializeForm();
          }
        }
      }
    })
  }

  /**
   * Define o formulário de e-mail com validações necessárias.
   */
  initializeForm() {
    this.emailForm = this.formBuilder.group({
      email: ['', [Validators.required, Validators.email]],
    })
  }

  /**
   * Processa a submissão do formulário de e-mail, validando e enviando os dados para a ação especificada pelo modo.
   */
  sendEmail() {
    this.submitted = true;
    this.errorMessages = [];

    if (this.emailForm.valid && this.mode) {
      this.emailValue = this.emailForm.get('email')?.value;
      if (this.mode.includes('resend-email-confirmation-link')) {
        this.authService.resendEmailConfirmationLink(this.emailValue).subscribe({
          next: (response: any) => {
            this.router.navigateByUrl('/account/login');
          },
          error: error => {
            if (error.error) {
              this.errorMessages[error.error.field] = error.error.message;
              this.saveSubmittedValues();
            }
          }
        });
      }
      else if (this.mode.includes('forgot-password')) {
        this.authService.forgotPassword(this.emailValue).subscribe({
          next: (response: any) => {
            this.router.navigateByUrl('/account/login');
          },
          error: error => {
            if (error.error) {
              this.errorMessages[error.error.field] = error.error.message;
              this.saveSubmittedValues();
            }
          }
        });
      }
    }
  }

  /**
   * Verifica se um campo específico do formulário foi modificado em relação ao valor originalmente submetido.
   *
   * @param fieldName Nome do campo a ser verificado.
   * @returns Booleano indicando se o campo foi modificado ou não.
   */
  isFieldModified(fieldName: string) {
    return this.emailForm.get(fieldName)!.value !== this.submittedValues[fieldName];
  }

  /**
   * Salva os valores submetidos do formulário para referência futura.
   */
  private saveSubmittedValues(): void {
    this.submittedValues["email"] = this.emailValue;
  }

  /**
   * Cancela a operação de envio de e-mail e redireciona o usuário para a página de login.
   */
  cancel() {
    this.router.navigateByUrl('/account/login');
  }
}
