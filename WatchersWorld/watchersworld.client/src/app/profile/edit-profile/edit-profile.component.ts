import { Component, ViewChild } from '@angular/core';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { Subject, switchMap, take, takeUntil } from 'rxjs';
import { Profile } from '../models/profile';
import { ProfileService } from '../services/profile.service';
import { User } from '../../authentication/models/user';
import { AuthenticationService } from '../../authentication/services/authentication.service';
import { ActivatedRoute, Router } from '@angular/router';
import { Title } from '@angular/platform-browser';
import { GamificationService } from '../../gamification/Service/gamification.service';
import { MessageService } from 'primeng/api'

/**
 * Componente responsável pela edição do perfil do utilizador.
 * Permite aos utilizadores alterar informações do seu perfil, como foto, biografia, e preferências de privacidade.
 */
@Component({
  selector: 'app-edit-profile',
  templateUrl: './edit-profile.component.html',
  styleUrls: ['./edit-profile.component.css']
})
export class EditProfileComponent {
  currentUsername: string | undefined;
  loggedUserName: string | null = null;

  profileForm: FormGroup = new FormGroup({});

  private unsubscribed$ = new Subject<void>();
  usersProfiles: Profile[] = [];
  message: string | undefined;
  errorMessages: any;
  userNameEditable = false;
  hobbyEditable = false;
  genderEditable = false;
  birthdateEditable = false;
  nameEditable = false;
  isDateEditable: boolean = false;
  userName: string = "NOME UTILIZADOR";
  coverPhoto: string = "";
  profilePhoto: string = "";
  profileLockedPhoto: string = 'assets/img/private.png';
  profileUnlockedPhoto: string = 'assets/img/public.png';
  isProfileLocked: boolean = false;
  profileLocked: string = "Public";

  followersCount: number | undefined;
  followingCount: number | undefined;

  showFavorites: boolean = false;
  showMovies: boolean = false;
  showSeries: boolean = false;
  showMedals: boolean = false;

  currentDate: string;
  minDate: string;

  medals: any[] = [];

  /**
   * Construtor da classe.
   * Inicializa os serviços necessários e define as datas mínima e máxima para o campo de data de nascimento.
   * @param profileService Serviço para operações relacionadas ao perfil do utilizador.
   * @param messageService Serviço para exibição de mensagens e notificações.
   * @param formBuilder Construtor de formulário para gerenciar campos de entrada de dados.
   * @param route Serviço de roteamento para acesso aos parâmetros da rota.
   * @param authService Serviço de autenticação para operações relacionadas à conta do utilizador.
   * @param router Serviço de roteamento para navegação entre rotas.
   * @param gamificationService Serviço para operações relacionadas à gamificação e medalhas.
   */
  constructor(private profileService: ProfileService,
    private messageService: MessageService,
    private formBuilder: FormBuilder,
    private route: ActivatedRoute, public authService: AuthenticationService, private router: Router,
    private gamificationService: GamificationService) {
    const today = new Date();
    this.currentDate = today.toISOString().split('T')[0];
    const earliestDate = new Date('1900-01-01');
    this.minDate = earliestDate.toISOString().split('T')[0];
  }

  /**
  * Método chamado na inicialização do componente.
  * Configura o formulário de edição do perfil e carrega os dados do perfil atual.
  */
  ngOnInit(): void {
    this.route.params.subscribe(params => {
      if (typeof params['username'] === 'string') {
        this.currentUsername = params['username'];
        this.getUserProfileInfo(this.currentUsername);
        this.setFormFields(this.currentUsername);
        this.setImages(this.currentUsername);
      }
    });
    this.initializeForm();
    this.getUserProfiles();
  }

  /**
  * Alterna o estado de edição de um campo específico do formulário.
  * @param field Nome do campo a ser editado.
  */
  toggleEdit(field: string) {
    switch (field) {
      case 'name':
        this.userNameEditable = !this.userNameEditable;
        this.toggleFormControl('name', this.userNameEditable);
        break;
      case 'hobby':
        this.hobbyEditable = !this.hobbyEditable;
        this.toggleFormControl('hobby', this.hobbyEditable);
        break;
      case 'gender':
        this.genderEditable = !this.genderEditable;
        this.toggleFormControl('gender', this.genderEditable);
        break;
      case 'birthdate':
        this.birthdateEditable = !this.birthdateEditable;
        const control = this.profileForm.get('date');
        if (control != null) {
          this.birthdateEditable ? control.enable() : control.disable();
        }
        break;
      case 'coverPhoto':
        this.openFileInput('coverPhoto');
        break;
      case 'profilePhoto':
        this.openFileInput('profilePhoto');
        break;
      default:
    }
  }

  /**
   * Carrega os perfis dos utilizadores para exibição.
   */
  getUserProfiles() {
    this.profileService.getUserProfiles().pipe(takeUntil(this.unsubscribed$)).subscribe(
      (profiles: Profile[]) => {
        this.usersProfiles = profiles;
      },
      (error) => {
        console.error("Error while fetching users' profiles:", error);
      }
    );
  }

  /**
   * Ativa ou desativa um campo de formulário com base no seu estado de edição.
   * @param controlName Nome do controle de formulário a ser alterado.
   * @param isEditable Estado de edição do controle.
   */
  private toggleFormControl(controlName: string, isEditable: boolean) {
    if (isEditable) {
      this.profileForm.get(controlName)?.enable();
    } else {
      this.profileForm.get(controlName)?.disable();
    }
  }

  /**
   * Alterna o estado de bloqueio do perfil entre público e privado.
   */
  toggleLock() {
    this.isProfileLocked = !this.isProfileLocked;
    //console.log(this.isProfileLocked);
    this.profileLocked = this.profileLocked === "Public" ? "Private" : "Public";
    //console.log(this.profileLocked);
  }

  /**
   * Abre o seletor de arquivos para troca de imagens do perfil ou capa.
   * @param target Identificador do elemento de entrada de arquivo a ser aberto.
   */
  openFileInput(target: string) {
    const fileInput = document.getElementById('fileInput') as HTMLInputElement | null;

    if (fileInput) {
      fileInput.setAttribute('data-target', target);
      fileInput.click();
    } else {
      console.error("File input element not found");
    }
  }

  /**
   * Lida com a seleção de uma nova imagem para o perfil ou capa.
   * @param event Evento contendo o arquivo de imagem selecionado.
   */
  changeImage(event: any) {
    const fileInput = event.target;
    const target = fileInput.getAttribute('data-target');

    if (target) {
      const file = (fileInput.files as FileList)[0];

      if (!file.type.match('image.*')) {
        this.messageService.clear();
        this.messageService.add({ key: 'toast2', severity: 'error', summary: 'Ficheiro Inválido', detail: 'Tipo de ficheiro inválido. Por favor, escolha uma imagem.' });
        return;
      }

      const reader = new FileReader();
      reader.onload = (e: any) => {
        if (target === 'profilePhoto') {
          this.profilePhoto = e.target.result;
        } else if (target === 'coverPhoto') {
          this.coverPhoto = e.target.result;
        }
      };
      reader.readAsDataURL(file);
    } else {
      console.error("Target not specified for changeImage");
    }
  }

  /**
   * Método chamado na destruição do componente.
   * Realiza a limpeza dos observáveis subscritos.
   */
  ngOnDestroy(): void {
    this.unsubscribed$.next();
    this.unsubscribed$.complete();
  }

  /**
   * Recupera informações do perfil do utilizador para preenchimento dos campos de edição.
   * @param username Nome do utilizador cujo perfil será recuperado.
   */
  getUserProfileInfo(username: string) {
    this.profileService.getUserData(username).subscribe({
      next: (response: Profile) => {
        return response;
      },
      error: (error) => {
        return error;
      }
    });
  }

  /**
  * Carrega e atribui as imagens de perfil e capa do utilizador nas suas respetivas posições na interface.
  * @param username Nome do utilizador cujas imagens serão carregadas.
  */
  setImages(username: string) {
    this.profileService.getUserData(username).pipe(takeUntil(this.unsubscribed$)).subscribe(
      (userData: Profile) => {
        const coverPhotoElement = document.querySelector(".cover-photo");
        const profilePhotoElement = document.querySelector(".profile-photo");

        if (coverPhotoElement instanceof HTMLImageElement && profilePhotoElement instanceof HTMLImageElement) {
          coverPhotoElement.src = userData.coverPhoto;
          profilePhotoElement.src = userData.profilePhoto;
        }
      },
      error => {
        if (error.error.errors) {
          this.errorMessages = error.error.errors;
        } else {
          this.errorMessages.push(error.error);
        }
      }
    );
  }

  /**
  * Inicializa o formulário de edição do perfil com validações e valores padrão.
  */
  initializeForm() {
    this.profileForm = this.formBuilder.group({
      hobby: ['', [Validators.required, Validators.maxLength(50)]],
      gender: [''],
      date: [{ value: '' }],
      name: [{ value: '' }]
    });
  }

  /**
  * Carrega os dados do utilizador e preenche os campos do formulário de edição.
  * @param username Nome do utilizador cujos dados serão carregados.
  */
  setFormFields(username: string) {
    this.profileForm.get('gender')?.disable();
    this.profileService.getUserData(username).pipe(takeUntil(this.unsubscribed$)).subscribe(
      (userData: Profile) => {
        //console.log(userData);
        if (userData.coverPhoto && this.coverPhoto !== userData.coverPhoto) { this.coverPhoto = userData.coverPhoto; }
        if (userData.profilePhoto && this.profilePhoto !== userData.profilePhoto) { this.profilePhoto = userData.profilePhoto; }
        if (userData.userName) {
          this.userName = userData.userName;
        }

        this.isProfileLocked = userData.profileStatus === 'Private';
        this.profileLocked = this.isProfileLocked ? 'Private' : 'Public';

        this.profileForm.patchValue({
          name: userData.userName = userData.userName?.toLowerCase(),
          hobby: userData.description = userData.description || "Por definir",
          gender: userData.gender = userData.gender || "Por definir",
          date: userData.birthDate ? new Date(userData.birthDate).toISOString().split('T')[0] : '',
        });
        if (this.loggedUserName)
          this.getUserProfileInfo(this.loggedUserName);
      },
      error => {
        if (error.error.errors) {
          this.errorMessages = error.error.errors;
        } else {
          this.errorMessages.push(error.error);
        }
      }
    );
  }

  /**
  * Verifica se o utilizador tem idade suficiente para usar a plataforma.
  * @param birthDate Data de nascimento do utilizador.
  * @returns Booleano indicando se o utilizador tem 12 anos ou mais.
  */
  isOldEnough(birthDate: string): boolean {
    const birthDateObj = new Date(birthDate);
    const today = new Date();
    var age = today.getFullYear() - birthDateObj.getFullYear();
    const m = today.getMonth() - birthDateObj.getMonth();
    if (m < 0 || (m === 0 && today.getDate() < birthDateObj.getDate())) {
      age--;
    }
    return age >= 12;
  }

  /**
  * Atualiza os campos do formulário com os dados fornecidos pelo utilizador.
  * @param username Nome do utilizador que está atualizando os dados.
  */
  updateFormFields(username: string) {
    const hobby = this.profileForm.get('hobby')?.value;
    const gender = this.profileForm.get('gender')?.value;
    const date = this.profileForm.get('date')?.value;
    const profilePhoto = this.profilePhoto;
    const coverPhoto = this.coverPhoto;
    const profileStatus = this.profileLocked;
    const numberOfFollowers = this.followersCount || 0;
    const numberOfFollowing = this.followingCount || 0;

    const data = new Profile(date, hobby, gender, profilePhoto, coverPhoto, profileStatus, numberOfFollowers, numberOfFollowing);
    //console.log(data);
    if (this.profileForm.valid) {
      this.profileService.setUserData(data).subscribe({
        next: (response: any) => {
          //console.log(response);
          this.setFormFields(username);
        },
        error: (error) => {
          console.error("Error during setUserData", error);
        }
      },
      );
    }
  }

  /**
  * Gera uma lista aleatória de outros utilizadores, limitada pelo tamanho especificado.
  * 
  * @param array Array original de perfis de utilizadores.
  * @param size Tamanho máximo da lista resultante.
  * @returns Array de `Profile` com tamanho máximo especificado e elementos aleatórios.
  */
  getRandomOtherUsers(array: Profile[], size: number): Profile[] {
    const arrayCopy = [...array];
    for (let i = arrayCopy.length - 1; i > 0; i--) {
      const j = Math.floor(Math.random() * (i + 1));
      [arrayCopy[i], arrayCopy[j]] = [arrayCopy[j], arrayCopy[i]];
    }
    return arrayCopy.slice(0, size);
  }

  /**
  * Ação executada ao clicar no botão de salvar. Valida a idade e atualiza as informações do perfil.
  * @param username Nome do utilizador que está salvando as alterações.
  */
  saveButton(username: string) {
    const date = this.profileForm.get('date')?.value;

    if (date && !this.isOldEnough(date)) {
      this.messageService.clear();
      this.messageService.add({ key: 'toast1', severity: 'error', summary: 'Data Inválida', detail: 'Data de nascimento inválida. O utilizador deve ter mais de 12 anos.' });
      //console.log("Data de nascimento inválida. O utilizador deve ter mais de 12 anos.")
      return;
    }

    this.updateFormFields(username);
    this.getMedals(username);
    this.router.navigate(['/profile/', username]);
  }

  /**
   * Envia um pedido de redefinição de senha para o e-mail do utilizador. Este método é acionado quando o utilizador solicita a mudança de senha.
  */
  sendEmailChangePassword() {
    this.authService.user$.pipe(take(1)).subscribe({
      next: (user: User | null) => {
        if (user) {
          this.authService.forgotPassword(user.email!).subscribe({
            next: (response: any) => {
              this.authService.logout();
              this.router.navigateByUrl('/account/login');
            },
            error: error => {
              console.log(error);
            }
          });
        }
      }
    });
  }

  /**
   * Permite ao utilizador apagar a sua conta permanentemente. Confirmação é solicitada antes de proceder com a eliminação.
  */
  deleteAccount() {
    if (confirm('Tem a certeza que quer apagar a conta? Esta ação será permanente.')) {
      var LoggedInUsername = this.authService.getLoggedInUserName();
      if (LoggedInUsername)
        this.profileService.deleteOwnAccount(LoggedInUsername).subscribe(
          (response) => {
            //console.log(response);
            this.router.navigateByUrl('/home');
          },
          (error) => {
            console.error('Error deleting account:', error);
          }
        );
    }
  }

  toggleFavorites() {
    this.showFavorites = !this.showFavorites;
  }

  toggleMovies() {
    this.showMovies = !this.showMovies;
  }

  toggleSeries() {
    this.showSeries = !this.showSeries;
  }

  toggleMedals() {
    this.showMedals = !this.showMedals;
  }

  /**
  * Carrega as medalhas desbloqueadas pelo utilizador e as exibe na interface.
  * @param username Nome do utilizador cujas medalhas serão carregadas.
  */
  getMedals(username: string) {
    if (this.currentUsername) {
      this.gamificationService.getUnlockedMedals(this.currentUsername).subscribe({
        next: (medals) => {
          this.medals = medals;
        },
        error: (err) => {
          console.error('Error retrieving medals:', err);
        }
      });
    } else {
      console.error('User ID is not defined');
    }
  }
}
