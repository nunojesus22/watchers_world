import { Component, ElementRef, Inject, OnInit, Renderer2, ViewChild, NgZone } from '@angular/core';
import { AuthenticationService } from '../services/authentication.service';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { Router } from '@angular/router';
import { User } from '../models/user';
import { take } from 'rxjs';
import { DOCUMENT } from '@angular/common';
import { CredentialResponse } from 'google-one-tap';
import { jwtDecode } from 'jwt-decode';

/**
 * Componente responsável pelo registro de novos usuários no sistema. Inclui opções para registro tradicional e registro através de serviços externos como Google.
 *
 * @Component Decorador que define a classe como um componente Angular com seu seletor, template HTML e arquivos de estilo associados.
 */
@Component({
  selector: 'app-registration',
  templateUrl: './registration.component.html',
  styleUrls: ['./registration.component.css']
})

export class RegistrationComponent implements OnInit{
  @ViewChild('googleButton', { static: true }) googleButton: ElementRef = new ElementRef({});
  registrationForm: FormGroup = new FormGroup([]);
  submitted = false;
  errorMessages: any = {};
  submittedValues: any = {};
  passwordFieldType: string = 'password';
  passwordIcon: string = 'fa fa-solid fa-eye-slash';

  /**
   * Construtor para inicializar dependências e configurações.
   *
   * @param authService Serviço de autenticação para gerenciar o registro e autenticação de usuários.
   * @param formBuilder Construtor de formulários para criação de formulários reativos.
   * @param router Serviço do router para navegação.
   * @param _renderer2 Renderer para manipulação de elementos DOM.
   * @param ngZone Serviço para execução de operações fora do Angular.
   * @param _document Documento para acesso ao DOM global.
   */
  constructor(
    private authService: AuthenticationService,
    private formBuilder: FormBuilder,
    private router: Router,
    private _renderer2: Renderer2,
    private ngZone: NgZone,

    @Inject(DOCUMENT) private _document: Document
  ) {
    this.authService.user$.pipe(take(1)).subscribe({
      next: (user: User | null) => {
        if (user) {
          this.router.navigateByUrl("/home");
        }
      }
    });
  }


  /**
   * Inicializa o componente configurando o formulário e o botão do Google.
   */
  ngOnInit(): void {
    this.initializeGoogleButton();
    this.initializeForm();
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

    ngAfterViewInit() {
    const script1 = this._renderer2.createElement('script');
    script1.src = 'https://accounts.google.com/gsi/client';
    script1.async = 'true';
    script1.defer = 'true';
    this._renderer2.appendChild(this._document.body, script1);
  }

  /**
   * Define o formulário de registro com validações necessárias para username, email e senha.
   */
  initializeForm() {
    this.registrationForm = this.formBuilder.group({
      username: ['', [Validators.required, Validators.minLength(4), Validators.maxLength(20)]],
      email: ['', [Validators.required, Validators.email]],
      password: ['', [Validators.required, Validators.minLength(8), Validators.pattern("(?=.*[a-z])(?=.*[A-Z])(?=.*\\d).{8,}"), Validators.maxLength(12)]]
    });
  }

  /**
   * Processa a submissão do formulário de registro, validando e enviando os dados para o servidor.
   */
  register() {
    this.submitted = true;
    this.errorMessages = {};
    this.submittedValues = {};
;
    if (this.registrationForm.valid) {
      this.authService.register(this.registrationForm.value).subscribe({
        next: (response) => {
          this.router.navigateByUrl('/account/confirm-email');
        },
        error: error => {
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
  * Verifica se um campo específico do formulário foi modificado em relação ao valor originalmente submetido.
  *
  * @param fieldName Nome do campo a ser verificado.
  * @returns Booleano indicando se o campo foi modificado ou não.
  */
  isFieldModified(fieldName: string) {
    return this.registrationForm.get(fieldName)!.value !== this.submittedValues[fieldName];
  }

  /**
   * Salva os valores submetidos do formulário para referência futura.
   */
  private saveSubmittedValues(): void {
    this.submittedValues["username"] = this.registrationForm.get("username")!.value;
    this.submittedValues["email"] = this.registrationForm.get("email")!.value;
  }

  /**
   * Configura o botão de registro do Google na página, inicializando a biblioteca de autenticação do Google e configurando o callback para o processo de autenticação.
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
        { size: 'medium', shape: 'rectangular', text: 'signup_with', logo_alignment: 'center' }
      );
    };
  }

  /**
   * Callback para o processo de autenticação com o Google. Trata o token recebido e envia para o servidor para autenticação e registro.
   *
   * @param response Resposta do serviço de autenticação do Google.
   */
  private async googleCallBack(response: CredentialResponse) {
    this.ngZone.run(() => {
      const decodedToken: any = jwtDecode(response.credential);
      this.router.navigateByUrl(`/account/register/third-party/google?access_token=${response.credential}&userId=${decodedToken.sub}&email=${decodedToken.email}`);
    });
  }

}
