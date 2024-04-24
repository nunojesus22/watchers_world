import { Component, ElementRef, OnInit, ViewChild } from '@angular/core';
import { GamificationService } from './Service/gamification.service';
import { MedalsDto } from './models/MedalsDto';
import { ActivatedRoute } from '@angular/router';
import { Profile } from '../profile/models/profile';
import { FormBuilder, FormGroup } from '@angular/forms';
import { Subject, firstValueFrom, takeUntil } from 'rxjs';
import { ProfileService } from '../profile/services/profile.service';
import { ChatService } from '../chat/services/chat.service';
import { AuthenticationService } from '../authentication/services/authentication.service';
import { MovieApiServiceComponent } from '../media/api/movie-api-service/movie-api-service.component';
import { AdminService } from '../admin/service/admin.service';
import { FollowerProfile } from '../profile/models/follower-profile';
import { ProfileChat } from '../chat/models/profileChat';

interface MovieCategory {
  name: string;
  results: any[];
  activeIndex: number;
  media_type: string;
}
/**
 * Componente responsável por exibir a gamificação do utilizador, incluindo medalhas desbloqueadas e bloqueadas.
 * Este componente permite aos utilizadores verem as suas conquistas dentro do sistema e o que ainda podem alcançar,
 * aumentando a interação e o engajamento com a plataforma.
 */
@Component({
  selector: 'app-gamification',
  templateUrl: './gamification.component.html',
  styleUrl: './gamification.component.css'
})
export class GamificationComponent implements OnInit {

  currentUsername: string | undefined;
  loggedUserName: string | null = null;
  isFollowing: boolean = false;
  loggedUserProfile: Profile | undefined;
  userPhoto: string | null = null;

  profileForm: FormGroup = new FormGroup({});

  private unsubscribed$ = new Subject<void>();

  message: string | undefined;
  errorMessages: any;

  usersProfiles: Profile[] = [];

  followersCount: number | undefined;
  followingCount: number | undefined;

  canViewData: boolean = false;
  isFollowRequestApproved: boolean = false;
  isProfilePublic: string | undefined;
  followRequestSent: boolean = false;

  showFollowers: boolean = true;
  showFollowing: boolean = true;

  showFavorites: boolean = true;
  showAllFavorites: boolean = false;

  showMoviesWatched: boolean = true;
  showAllMoviesWatched: boolean = false;

  showMoviesToWatch: boolean = true;
  showAllMoviesToWatch: boolean = false;

  showSeriesWatched: boolean = true;
  showAllSeriesWatched: boolean = false;

  showSeriesToWatch: boolean = true;
  showAllSeriesToWatch: boolean = false;

  showMedals: boolean = true;

  expandedFollowers: boolean = false;
  expandedFollowing: boolean = false;

  expandedFavoritesList: boolean = false;

  expandedMoviesWatchList: boolean = false;
  expandedMoviesToWatchList: boolean = false;

  expandedSeriesWatchList: boolean = false;
  expandedSeriesToWatchList: boolean = false;

  showAllFollowing = false;
  showAllFollowers = false;
  showFiveOtherUsers = false;
  showExpandedSuggestions = false;

  categories: MovieCategory[] = [];
  favoriteMovies: any[] = [];
  favoriteSeries: any[] = [];
  watchedMovies: any[] = [];
  watchedSeries: any[] = [];
  watchLaterMovies: any[] = [];
  watchLaterSeries: any[] = [];
  getMovieDetailResult: any;

  isBanPopupVisible = false;
  isModerator: boolean = false;
  banDuration: number | undefined;
  isBanned?: boolean;
  selectedUserForBan: string | null = null;


  unlockedMedals: MedalsDto[] = [];
  medals: MedalsDto[] = [];
  showAllMedals = false;

  @ViewChild('usernameHeader') usernameHeader!: ElementRef;

  /**
 * Construtor do componente ProfileComponent.
 * Inicializa os serviços e ferramentas necessárias para a gestão do perfil do utilizador.
 * @param profileService Serviço para interação com dados de perfil do utilizador.
 * @param chatService Serviço para gestão de mensagens e chat.
 * @param formBuilder Ferramenta para criação de formulários reativos.
 * @param route Serviço para interação com a rota ativa.
 * @param authService Serviço de autenticação, utilizado para gestão do estado de login do utilizador.
 * @param service Serviço para interação com a API de media (filmes e séries).
 * @param adminService Serviço para interações específicas de administradores.
 * @param gamificationService Serviço para gestão de elementos de gamificação, como medalhas.
 */
  constructor(private profileService: ProfileService,
    private chatService: ChatService,
    private formBuilder: FormBuilder,
    private route: ActivatedRoute, public authService: AuthenticationService,
    private service: MovieApiServiceComponent, private adminService: AdminService,
    private gamificationService: GamificationService) { }

  /**
   * Método chamado imediatamente após a criação do componente.
   * Subscreve a mudanças na rota ativa e ao estado de autenticação do utilizador para carregar os dados de perfil necessários.
   * Inicializa o formulário de perfil e carrega dados de media e gamificação associados ao perfil visualizado.
   */
  ngOnInit(): void {
    window.scrollTo({ top: 0, behavior: 'smooth' });
    this.route.params.subscribe(params => {
      if (typeof params['username'] === 'string') {
        this.currentUsername = params['username'];
      }
      this.authService.user$.subscribe(user => {
        this.loggedUserName = user ? user.username : null;
        if (this.currentUsername && this.loggedUserName && this.currentUsername !== this.loggedUserName) {
          this.checkFollowingStatus(this.loggedUserName, this.currentUsername);
        }
      });
      this.loadUserRole();
      if (this.currentUsername) {
        this.getUserProfileInfo(this.currentUsername);
        this.setFormFields(this.currentUsername);
        this.setImages(this.currentUsername);
        this.getMedals(this.currentUsername);
        this.getLockedMedals();

      }
    });
    if (this.currentUsername && this.usernameHeader) {
      this.usernameHeader.nativeElement.textContent = this.currentUsername;
    }

    this.loggedUserName = this.authService.getLoggedInUserName();

    this.getUserProfiles();
    this.initializeForm();
    this.categories = [
      { name: 'Trending Movies', results: [], activeIndex: 0, media_type: "movie" },
    ];
    this.fetchTrending();

  }

  /**
  * Carrega dados de trending de media da API e atribui os resultados às categorias correspondentes.
  * Utilizado para exibir media em destaque ou mais popular na página de perfil do utilizador.
  */
  fetchTrending() {
    const fetchMethods = [
      this.service.trendingMovieApiData(),
    ];

    fetchMethods.forEach((fetchMethod, index) => {
      fetchMethod.subscribe((result) => {
        this.categories[index].results = result.results;
      });
    });
  }

  /**
  * Método chamado imediatamente antes da destruição do componente.
  * Responsável por cancelar todas as subscrições ativas para evitar memory leaks.
  */
  ngOnDestroy(): void {
    this.unsubscribed$.next();
    this.unsubscribed$.complete();
  }

  /**
  * Obtém a informação do perfil do utilizador especificado pelo nome de utilizador.
  * Atualiza a variável de estado `canViewData` baseada no status do perfil e se
  * o utilizador logado tem permissão para ver o perfil.
  * 
  * @param username Nome do utilizador do perfil a ser obtido.
  * @returns Promise<void> Uma promessa que resolve quando a informação do perfil
  * é obtida com sucesso ou rejeitada em caso de erro.
  */
  getUserProfileInfo(username: string): Promise<void> {
    return new Promise((resolve, reject) => {
      this.profileService.getUserData(username).subscribe({
        next: (userData: Profile) => {
          this.isProfilePublic = userData.profileStatus;
          this.followersCount = userData.followers;
          this.followingCount = userData.following;
          this.userPhoto = userData.profilePhoto;

          if (this.isProfilePublic !== 'Public' && this.loggedUserName && this.loggedUserName !== username) {
            this.profileService.alreadyFollows(this.loggedUserName, username)
              .subscribe(isFollowing => {
                this.canViewData = isFollowing;
                resolve();
              }, error => {
                console.error('Erro ao verificar o status de seguimento', error);
                this.canViewData = false;
                reject(error);
              });
          } else {

            this.canViewData = true;
            resolve();
          }
        },
        error: (error) => {
          console.error("Error while fetching user data:", error);
          reject(error);
        }
      });
    });
  }

  /**
  * Carrega o papel (role) do utilizador logado para determinar se é um moderador.
  * Atualiza a propriedade `isModerator` baseada nas roles retornadas.
  */
  private loadUserRole() {
    const currentUsername = this.authService.getLoggedInUserName();
    if (currentUsername) {
      this.authService.getUserRole(currentUsername).subscribe(roles => {
        this.isModerator = roles.includes('Moderator');
      }, error => {
        console.error('Error fetching roles:', error);
      });
    }
  }

  /**
  * Inicializa o formulário com os campos padrão.
  */
  initializeForm() {
    this.profileForm = this.formBuilder.group({
      hobby: [''],
      gender: ['', { disabled: true }],
      date: [''],
    });
  }

  /**
  * Define as imagens de perfil e de capa para o utilizador especificado.
  * 
  * @param username Nome do utilizador para o qual as imagens serão definidas.
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
  * Preenche os campos do formulário com os dados do perfil do utilizador.
  * 
  * @param username Nome do utilizador cujos dados do perfil serão utilizados para preencher o formulário.
  */
  setFormFields(username: string) {
    const userName = document.querySelector("h1");
    this.profileForm.get('gender')?.disable();
    this.profileService.getUserData(username)
      .pipe(takeUntil(this.unsubscribed$))
      .subscribe({
        next: (userData: Profile) => {
          if (userName) { userName.textContent = username; }
          this.profileForm.patchValue({
            hobby: " " + userData.description || "Por definir",
            gender: userData.gender || "Por definir",
            date: "‎ " + userData.birthDate ? new Date(userData.birthDate).toISOString().split('T')[0] : '',
          });
          this.profileForm.get('gender')?.disable();
          this.followersCount = userData.followers;
          this.followingCount = userData.following;
        },
        error: (error) => {
          console.error("Error while fetching user data:", error);
          if (error.error && error.error.errors) {
            this.errorMessages = error.error.errors;
          } else {
            this.errorMessages.push(error.message || 'An error occurred while fetching user data.');
          }
        }
      });
  }

  /**
  * Verifica se o utilizador autenticado segue o utilizador especificado.
  * Atualiza a propriedade `isFollowing` baseada no resultado.
  * 
  * @param usernameAuthenticated Nome do utilizador autenticado.
  * @param usernameToCheck Nome do utilizador a verificar se está a ser seguido.
  */
  checkFollowingStatus(usernameAuthenticated: string, usernameToCheck: string): void {
    this.profileService.alreadyFollows(usernameAuthenticated, usernameToCheck).subscribe(isFollowing => {
      this.isFollowing = isFollowing;
    }, error => {
      console.error('Erro ao verificar o status de seguimento', error);
    });
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
  * Obtém e atualiza a lista de perfis de utilizadores sugeridos, limitada a 5.
  */
  getUserProfiles() {
    this.profileService.getUserProfiles().pipe(takeUntil(this.unsubscribed$)).subscribe(
      (profiles: Profile[]) => {
        this.usersProfiles = this.getRandomOtherUsers(profiles, 5);
      },
      (error) => {
        console.error("Error while fetching users' profiles:", error);
      }
    );
  }

  toggleAllFiveOtherUsers(): void {
    this.showFiveOtherUsers = !this.showFiveOtherUsers;
  }

  toggleExpandedSuggestions() {
    this.showExpandedSuggestions = !this.showExpandedSuggestions;
  }


  //--------------------------------------------------MEDALHAS-------------------------------------------------------------------

  /**
   * Recupera as medalhas desbloqueadas pelo utilizador.
   * Este método consulta o serviço de gamificação para obter as medalhas que o utilizador já conseguiu desbloquear.
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

  getLockedMedals(): void {
    if (this.currentUsername)
      this.gamificationService.getLockedMedals(this.currentUsername).subscribe({
        next: (medals) => {
          this.unlockedMedals = medals;
        },
        error: (err) => {
          console.error('Error retrieving available medals:', err);
        }
      });
  }

}
