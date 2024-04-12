import { Component, OnInit, NgZone } from '@angular/core';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { ActivatedRoute, Router } from '@angular/router';
import { AuthenticationService } from '../services/authentication.service';
import { take } from 'rxjs';
import { User } from '../models/user';
import { RegisterWithExternal } from '../models/registerWithExternal';

/**
 * Componente Angular para registro utilizando um serviço de autenticação de terceiros.
 * Permite aos usuários registrar-se utilizando credenciais de terceiros, como Google, facilitando o processo de registro sem a necessidade de criar uma senha específica para o site.
 *
 * @Component Decorador que define a classe como um componente Angular, especificando o seletor, template HTML e arquivo de estilo.
 */
@Component({
  selector: 'app-register-with-third-party',
  templateUrl: './register-with-third-party.component.html',
  styleUrl: './register-with-third-party.component.css'
})
export class RegisterWithThirdPartyComponent implements OnInit {

  registerForm: FormGroup = new FormGroup({});

  submitted = false;
  provider: string | null = null;
  access_token: string | null = null;
  userId: string | null = null;
  email: string | null = null;

  errorMessages: any = {};
  submittedValues: any = {};

  /**
   * Construtor para inicializar dependências.
   *
   * @param accountService Serviço de autenticação para realizar o registro com um provedor de terceiros.
   * @param router Serviço do router para navegação.
   * @param activatedRoute Serviço para acesso aos parâmetros da rota ativa.
   * @param ngZone Serviço para execução de operações fora do Angular.
   * @param formBuilder Construtor de formulários para criação de formulários reativos.
   */
  constructor(private accountService: AuthenticationService,
    private router: Router,
    private activatedRoute: ActivatedRoute,
    private ngZone: NgZone,
    private formBuilder: FormBuilder) { }

  /**
   * Inicializa o componente verificando o estado de autenticação do usuário e configurando o formulário se necessário.
   */
  ngOnInit(): void {
    this.accountService.user$.pipe(take(1)).subscribe({
      next: (user: User | null) => {
        if (user) {
          this.router.navigateByUrl('/');
        } else {
          this.activatedRoute.queryParamMap.subscribe({
            next: (params: any) => {
              this.provider = this.activatedRoute.snapshot.paramMap.get('provider');
              this.access_token = params.get('access_token');
              this.userId = params.get('userId');
              this.email = params.get('email');
              if (this.provider && this.access_token && this.userId && this.email && (this.provider === 'google')) {
                this.initializeForm();
              } else {
                this.router.navigateByUrl('/account/register');
              }
            }
          });



        }
      }
    });
  }

  /**
   * Configura o formulário de registro com as validações necessárias.
   */
  initializeForm() {
    this.registerForm = this.formBuilder.group({
      username: ['', [Validators.required, Validators.minLength(4), Validators.maxLength(20)]],
    });

  }

  /**
   * Processa a submissão do formulário de registro, validando e enviando os dados para a ação de registro com terceiros.
   */
  register() {
    this.submitted = true;
    this.errorMessages = {};
    this.submittedValues = {};

    if (this.registerForm.valid && this.userId && this.access_token && this.provider && this.email) {
      const userName = this.registerForm.get('username')?.value;
      const model = new RegisterWithExternal(userName, this.userId, this.access_token, this.provider, this.email);
      this.accountService.registerWithThirdParty(model).subscribe({
        next: _ => {
          this.router.navigateByUrl('/');
        },
        error: error => {
          this.ngZone.run(() => {
            this.errorMessages[error.error.field] = error.error.message;
            this.saveSubmittedValues();
          });
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
    return this.registerForm.get(fieldName)!.value !== this.submittedValues[fieldName];
  }

  /**
  * Salva os valores submetidos do formulário para futura referência em caso de erros.
  */
  private saveSubmittedValues(): void {
    this.submittedValues["username"] = this.registerForm.get("username")!.value;

  }

  /**
   * Navega de volta para a página de registro normal em caso de cancelamento ou erro.
   */
  registerBack() {
    this.router.navigateByUrl('/account/register');
  }

}

