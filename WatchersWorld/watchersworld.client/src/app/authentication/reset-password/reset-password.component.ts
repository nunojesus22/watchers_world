import { Component } from '@angular/core';
import { AuthenticationService } from '../services/authentication.service';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { ActivatedRoute, Router } from '@angular/router';
import { User } from '../models/user';
import { take } from 'rxjs';
import { ResetPassword } from '../models/resetPassword';

/**
 * Componente Angular para redefinir a senha do usuário.
 * Utiliza um formulário para coletar a nova senha do usuário e envia ao backend para atualização.
 *
 * @Component Decorador que define a classe como um componente Angular, especificando o seletor, template HTML e arquivo de estilo.
 */
@Component({
  selector: 'app-reset-password',
  templateUrl: './reset-password.component.html',
  styleUrl: './reset-password.component.css'
})
export class ResetPasswordComponent {
  passwordForm: FormGroup = new FormGroup({});
  submitted = false;
  mode: string | undefined;
  errorMessages: any = {};
  submittedValues: any = {};
  passwordValue: string = "";
  token: string | undefined;
  email: string | undefined;

  /**
   * Construtor para inicializar dependências.
   *
   * @param authService Serviço de autenticação para realizar a redefinição de senha.
   * @param formBuilder Construtor de formulários para criação de formulários reativos.
   * @param router Serviço do router para navegação.
   * @param activatedRoute Serviço para acesso aos parâmetros da rota ativa.
   */
  constructor(private authService: AuthenticationService,
    private formBuilder: FormBuilder,
    private router: Router,
    private activatedRoute: ActivatedRoute,
  ) { }

  /**
   * Inicializa o componente verificando o estado de autenticação do usuário e configura o formulário se necessário.
   */
  ngOnInit(): void {
    this.authService.user$.pipe(take(1)).subscribe({
      next: (user: User | null) => {
        if (user) {
          this.router.navigateByUrl('/home');
        } else {
          this.activatedRoute.queryParamMap.subscribe({
            next: (params: any) => {
              this.token = params.get('token');
              this.email = params.get('email');
              if (this.token && this.email) {
                this.initializeForm();
              } else {
                this.router.navigateByUrl("/account/login");
              }
            }
          })
        }
      }
    })
  }

  /**
   * Define o formulário de redefinição de senha com as validações necessárias.
   */
  initializeForm() {
    this.passwordForm = this.formBuilder.group({
      newPassword: ['', [Validators.required, Validators.minLength(8), Validators.pattern("(?=.*[a-z])(?=.*[A-Z])(?=.*\\d).{8,}"), Validators.maxLength(12)]]
    })
  }

  /**
   * Processa a submissão do formulário de redefinição de senha, validando e enviando os dados para a ação especificada.
   */
  resetPassword() {
    this.submitted = true;
    this.errorMessages = {};
    if (this.passwordForm.valid && this.email && this.token) {
      const model: ResetPassword = {
        token: this.token,
        email: this.email,
        newPassword: this.passwordForm.get('newPassword')?.value,
      }

      this.authService.resetPassword(model).subscribe({
        next: (response: any) => {
          this.router.navigateByUrl('/account/login');
        },
        error: (error) => {
          console.log(error);
        }
      });
    }
  }

  /**
   * Verifica se um campo específico do formulário foi modificado em relação ao valor originalmente submetido.
   *
   * @param fieldName Nome do campo a ser verificado.
   * @returns Booleano indicando se o campo foi modificado ou não.
   */
  isFieldModified(fieldName: string) {
    return this.passwordForm.get(fieldName)!.value !== this.submittedValues[fieldName];
  }

  /**
   * Cancela a operação de redefinição de senha e redireciona o usuário para a página inicial.
   */
  cancel() {
    this.router.navigateByUrl('/home');
  }
}
