import { Component, ElementRef, Inject, Renderer2, ViewChild, NgZone } from '@angular/core';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { ActivatedRoute, Route, Router } from '@angular/router';
import { AuthenticationService } from '../services/authentication.service';
import { take } from 'rxjs';
import { User } from '../models/user';
import { CredentialResponse } from 'google-one-tap';
import { LoginWithExternal } from '../models/loginWithExternals';
import { jwtDecode } from 'jwt-decode';
import { DOCUMENT } from '@angular/common';
import { ChatService } from '../../chat/services/chat.service';

/**
 * Componente responsável pela interface de login de usuários, incluindo autenticação por email/senha e serviços externos como Google.
 *
 * @Component Decorador que define a classe como um componente Angular com seu seletor e metadados associados.
 */
@Component({
  selector: 'app-login',
  templateUrl: './login.component.html',
  styleUrl: './login.component.css'
})
export class LoginComponent {
  @ViewChild('googleButton', { static: true }) googleButton: ElementRef = new ElementRef({});
  loginForm: FormGroup = new FormGroup([]);
  submitted = false;
  errorMessages: any = {};
  submittedValues: any = {};
  returnUrl: string | null = null;
  banDurationMessage: string = '';
  passwordFieldType: string = 'password';
  passwordIcon: string = 'fa fa-solid fa-eye-slash';

  /**
   * Construtor para inicializar dependências e configurações.
   *
   * @param authService Serviço de autenticação para gerenciar a autenticação de usuários.
   * @param formBuilder Construtor de formulários para criação de formulários reativos.
   * @param router Serviço do router para navegação.
   * @param activatedRoute Serviço de rota ativada para acesso a parâmetros de rota.
   * @param _renderer2 Renderer para manipulação de elementos DOM.
   * @param ngZone Serviço para execução de operações dentro da zona Angular.
   * @param chatService Serviço de chat para gerenciar conexões de websocket.
   * @param _document Documento para acesso ao DOM global.
   */
  constructor(
    private authService: AuthenticationService,
    private formBuilder: FormBuilder,
    private router: Router,
    private activatedRoute: ActivatedRoute,
    private _renderer2: Renderer2,
    private ngZone: NgZone,
    private chatService: ChatService,

    @Inject(DOCUMENT) private _document: Document
  ) {
    this.authService.user$.pipe(take(1)).subscribe({
      next: (user: User | null) => {
        if (user) {
          this.router.navigateByUrl("/home");
        } else {
          this.activatedRoute.queryParamMap.subscribe({
            next: (params: any) => {
              if (params) {
                this.returnUrl = params.get('returnUrl');
              }
            }
          })
        }
      }
    });
  }

  /**
   * Inicializa o componente e prepara o ambiente, como o botão do Google e o formulário de login.
   */
  ngOnInit(): void {
    this.initializeGoogleButton();
    this.initializeForm();
  }

  /**
   * Inicializa o formulário de login com validações básicas.
   */
  initializeForm() {
    this.loginForm = this.formBuilder.group({
      email: ['', [Validators.required]],
      password: ['', [Validators.required]]
    });
  }

  /**
   * Troca a visualização da palavra passe.
   */
  togglePasswordVisibility(): void {
    if (this.passwordFieldType === 'password') {
      this.passwordFieldType = 'text';
      this.passwordIcon = 'fa fa-solid fa-eye';
    } else {
      this.passwordFieldType = 'password';
      this.passwordIcon = 'fa fa-solid fa-eye-slash';
    }
  }

  /**
   * Carrega e configura o script externo do Google para o botão de login.
   */
  ngAfterViewInit() {
    const script1 = this._renderer2.createElement('script');
    script1.src = 'https://accounts.google.com/gsi/client';
    script1.async = 'true';
    script1.defer = 'true';
    this._renderer2.appendChild(this._document.body, script1);

  }

  /**
   * Submete o formulário de login e processa a resposta.
   */
  login() {
    this.submitted = true;
    this.errorMessages = {};
    this.submittedValues = {};

    if (this.loginForm.valid) {
      this.authService.login(this.loginForm.value).subscribe({
        next: (response: any) => {
          if (response.message === "A conta está por confirmar!") {
            this.router.navigateByUrl('/account/confirm-email');
          } else if (this.returnUrl) {
            this.router.navigateByUrl(this.returnUrl);
            this.connectChatHub();
          } else {
            this.router.navigateByUrl('/home');
            this.connectChatHub();
          }
        },
        error: (error) => {
          // Handle the banned user case
          if (error.error.Field === "Banned") {
            this.router.navigateByUrl('/suspendedAccount');
            return;
          }

          // Handle other errors
          if (error.error.errors) {
            error.error.errors.forEach((value: any) => {
              if (!this.errorMessages[value.field]) {
                this.errorMessages[value.field] = value.message;
              }
            });
            this.saveSubmittedValues();
          } else {
            this.errorMessages[error.error.field] = error.error.message;
            this.saveSubmittedValues();
          }
        }
      });
    }
  }


  /**
 * Configura o botão de login do Google One Tap na página de login. Este método é responsável por carregar a biblioteca do Google, inicializar o botão de login com as configurações desejadas e definir o callback para o processo de autenticação.
 */
  private initializeGoogleButton() {
    (window as any).onGoogleLibraryLoad = () => {
      //@ts-ignore
      google.accounts.id.initialize({
        client_id: '290666772375-5s2b58vflc2ohpc01f7q1hguo9k5gpi7.apps.googleusercontent.com',
        callback: this.googleCallBack.bind(this),
        auto_select: false,
        cancel_on_tap_outside: true
      });
      //@ts-ignore
      google.accounts.id.renderButton(
        this.googleButton.nativeElement,
        { size: 'medium', shape: 'rectangular', text: 'signin_with', logo_alignment: 'center' }
      );
    };
  }

  /**
   * Método de callback para lidar com a autenticação bem-sucedida ou falhas usando o Google One Tap.
   * 
   * @param response Resposta da autenticação Google One Tap.
   */
  private async googleCallBack(response: CredentialResponse) {
    this.errorMessages = {};
    this.submittedValues = {};

    if (response.credential) {
      const decodedToken: any = jwtDecode(response.credential);
      this.authService.loginWithThirdParty(new LoginWithExternal(response.credential, decodedToken.sub, "google", decodedToken.email)).subscribe({
        next: _ => {
          this.ngZone.run(() => {
            if (this.returnUrl) {
              this.router.navigateByUrl(this.returnUrl);
              this.connectChatHub();
            } else {
              this.router.navigateByUrl('/');
              this.connectChatHub();
            }
          });
        },
        error: error => {
          this.ngZone.run(() => {
            // Check if the error field indicates the user is banned and handle the message
            if (error.error.field === "Banned") {
              // Here we assume the backend sends a readable ban duration in the response
              //this.banDurationMessage = `A sua conta encontra-se suspensa por ${error.error.BanDuration}.`;
              this.banDurationMessage = `A sua conta encontra-se suspensa.`;
              this.router.navigateByUrl('/suspendedAccount', { state: { banDurationMessage: this.banDurationMessage } });
            } else {
              // Handle other errors by displaying them to the user
              if (error.error.errors) {
                // If there are multiple error messages, process them
                console.log(error.error.errors);
                error.error.errors.forEach((value: any) => {
                  this.errorMessages[value.field] = value.message;
                });
              } else {
                // If there's a single error message, display it
                if (error.error.message === "Não existe nenhuma conta associada a esse email!") {
                  const decodedToken: any = jwtDecode(response.credential);
                  this.router.navigateByUrl(`/account/register/third-party/google?access_token=${response.credential}&userId=${decodedToken.sub}&email=${decodedToken.email}`);
                }
                this.errorMessages[error.error.field] = error.error.message;
              }
              this.saveSubmittedValues();
            }
          });
        }
      });
    } else {
      // Handle the case where the Google sign-in response did not include a credential
      this.errorMessages['googleLogin'] = 'Failed to sign in with Google.';
      this.saveSubmittedValues();
    }
  }

  /**
 * Verifica se um campo do formulário foi modificado em relação ao valor originalmente submetido.
 *
 * @param fieldName O nome do campo do formulário a ser verificado.
 * @returns Booleano indicando se o valor do campo foi modificado ou não.
 */
  isFieldModified(fieldName: string): boolean {
    return this.loginForm.get(fieldName)!.value !== this.submittedValues[fieldName];
  }

  /**
 * Salva os valores submetidos do formulário de login para comparações futuras. Isso é útil para verificar se os campos foram modificados desde a última submissão.
 */
  private saveSubmittedValues(): void {
    this.submittedValues["email"] = this.loginForm.get("email")!.value;
    this.submittedValues["password"] = this.loginForm.get("password")!.value;
  }

  /**
 * Inicia a conexão com o serviço de chat através do ChatService, configurando o usuário para receber e enviar mensagens em tempo real.
 */
  private connectChatHub(): void {
    this.chatService.startConnectionAndListen();
  }

}
