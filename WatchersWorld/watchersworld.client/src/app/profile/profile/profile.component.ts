import { Component, ElementRef, OnInit, ViewChild } from '@angular/core';
import { ProfileService } from '../services/profile.service';
import { Profile } from '../models/profile';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { Subject, catchError, firstValueFrom, forkJoin, map, mergeMap, of, takeUntil } from 'rxjs';
import { ActivatedRoute } from '@angular/router';
import { AuthenticationService } from '../../authentication/services/authentication.service';
import { FollowerProfile } from '../models/follower-profile';
import { MovieApiServiceComponent } from '../../media/api/movie-api-service/movie-api-service.component';
import { UserMedia } from '../models/user-media';
import { Title } from '@angular/platform-browser';
import { AdminService } from '../../admin/service/admin.service';
import { NotificationService } from '../../notifications/services/notification.service';
import { GamificationService } from '../../gamification/Service/gamification.service';
import { ChatService } from '../../chat/services/chat.service';
import { ProfileChat } from '../../chat/models/profileChat';

interface MovieCategory {
  name: string;
  results: any[];
  activeIndex: number;
  media_type: string;
}

/**
 * Componente para a página de perfil do utilizador.
 * Permite visualizar e interagir com o perfil do utilizador, incluindo seguir/desseguir, enviar mensagens e visualizar media favorita.
 */
@Component({
  selector: 'app-profile',
  templateUrl: './profile.component.html',
  styleUrl: './profile.component.css'
})
export class ProfileComponent implements OnInit {

  currentUsername: string | undefined;
  loggedUserName: string | null = null;
  isFollowing: boolean = false;
  loggedUserProfile: Profile | undefined;
  userPhoto: string | null = null;
  userAge: number | undefined;

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

  followers: FollowerProfile[] = [];
  following: FollowerProfile[] = [];

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


  medals: any[] = [];
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
        this.getFollowersList();
        this.getFollowingList();
        this.getFavorites(this.currentUsername);
        this.getWatchedMedia(this.currentUsername);
        this.getWatchLaterMedia(this.currentUsername);
        this.getMedals();
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

  calculateAge(birthDate: Date): number {
    const today = new Date();
    let age = today.getFullYear() - birthDate.getFullYear();
    const m = today.getMonth() - birthDate.getMonth();
    if (m < 0 || (m === 0 && today.getDate() < birthDate.getDate())) {
      age--;
    }
    return age;
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
          if (userData.birthDate) {
            this.userAge = this.calculateAge(new Date(userData.birthDate));
          }
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
  * Define a propriedade `followRequestSent` como verdadeira, indicando que um pedido
  * de seguimento foi enviado.
  */
  requestToFollow(): void {
    this.followRequestSent = true;
  }

  /**
  * Envia um pedido para seguir o utilizador atual. Atualiza as propriedades `isFollowing`
  * e `followRequestSent` baseadas na resposta.
  */
  followUser(): void {
    if (this.currentUsername && this.loggedUserName) {
      this.profileService.followUser(this.loggedUserName, this.currentUsername).subscribe({
        next: () => {
          if (this.isProfilePublic === 'Private') {
            this.isFollowing = false;
            this.followRequestSent = true;
          } else {
            this.isFollowing = true;
            this.followRequestSent = false;
          }
        },
        error: (error) => {
          console.error('Erro ao seguir utilizador', error);
        }
      });
    } else {
      console.error('Nome de utilizador atual ou nome de utilizador logado está indefinido.');
    }
  }

  /**
  * Envia um pedido para deixar de seguir o utilizador atual. Atualiza a propriedade `isFollowing`.
  */
  unfollowUser(): void {
    if (this.currentUsername && this.loggedUserName) {
      this.profileService.unfollowUser(this.loggedUserName, this.currentUsername)
        .subscribe({
          next: () => {
            this.isFollowing = false;
          },
          error: (error) => {
            console.error('Erro ao deixar de seguir utilizador', error);
          }
        });
    } else {
      console.error('Os nomes de utilizador do perfil logado ou do perfil a ser seguido não estão definidos.');
    }
  }

  /**
  * Inicia uma conversa com o utilizador atual através do serviço de chat.
  */
  sendMessageToUser(): void {
    if (this.currentUsername && this.loggedUserName) {
      var profile = {
        userName: this.currentUsername,
        profilePhoto: this.userPhoto,
        lastMessage: undefined,
      } as ProfileChat;
      this.chatService.selectUser(profile);
    } else {
      console.error('Os nomes de utilizador do perfil logado ou do perfil a ser seguido não estão definidos.');
    }
  }

  /**
  * Gera uma lista aleatória de seguidores ou de utilizadores que estão a seguir,
  * limitada pelo tamanho especificado.
  * 
  * @param array Array original de seguidores ou seguindo.
  * @param size Tamanho máximo da lista resultante.
  * @returns Array de `FollowerProfile` com tamanho máximo especificado e elementos aleatórios.
  */
  getRandomFollowslist(array: FollowerProfile[], size: number): FollowerProfile[] {
    const arrayCopy = [...array];
    for (let i = arrayCopy.length - 1; i > 0; i--) {
      const j = Math.floor(Math.random() * (i + 1));
      [arrayCopy[i], arrayCopy[j]] = [arrayCopy[j], arrayCopy[i]];
    }
    return arrayCopy.slice(0, size);
  }

  /**
  * Obtém e atualiza a lista de seguidores do utilizador atual.
  */
  getFollowersList(): void {
    if (this.currentUsername) {
      this.profileService.getFollowers(this.currentUsername).subscribe(followers => {
        this.followers = this.getRandomFollowslist(followers, followers.length);
      }, error => {
        console.error("Error while fetching followers:", error);
      });
    }
  }

  /**
  * Obtém e atualiza a lista de utilizadores que o utilizador atual está a seguir.
  */
  getFollowingList(): void {
    if (this.currentUsername) {
      this.profileService.getFollowing(this.currentUsername).subscribe(following => {
        this.following = this.getRandomFollowslist(following, following.length);
      }, error => {
        console.error("Error while fetching following:", error);
      });
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

  /*----------------------------------------------------------------  FAVORITOS ---------------------------------------------------------------- */

  /**
  * Obtém e processa a lista de mídias favoritas do utilizador especificado, incluindo filmes e séries.
  * Para cada mídia, busca detalhes adicionais como descrição e capa.
  * 
  * @param username Nome do utilizador cujas mídias favoritas serão obtidas.
  */
  async getFavorites(username: string): Promise<void> {
    try {
      const favorites = await firstValueFrom(this.profileService.getFavoriteMedia(username));

      this.favoriteMovies = favorites.filter(m => m.type === 'movie').reverse();
      this.favoriteSeries = favorites.filter(m => m.type === 'serie').reverse();

      for (const movie of this.favoriteMovies) {
        try {
          const details = await firstValueFrom(this.service.getMovieDetails(movie.mediaId));
          movie.details = details;
        } catch (error) {
          console.error('Erro ao buscar detalhes do filme favorito', error);
        }
      }

      for (const series of this.favoriteSeries) {
        try {
          const details = await firstValueFrom(this.service.getSerieDetails(series.mediaId));
          series.details = details;
        } catch (error) {
          console.error('Erro ao buscar detalhes da série favorita', error);
        }
      }
    } catch (error) {
      console.error('Erro ao buscar mídia favorita para utilizador', username, error);
    }
  }

  /*----------------------------------------------------------------  MEDIA JÁ VISTA ---------------------------------------------------------------- */

  /**
  * Obtém e processa a lista de mídias assistidas pelo utilizador especificado, separando entre filmes e séries.
  * Busca detalhes adicionais de cada mídia assistida.
  * 
  * @param username Nome do utilizador cujas mídias assistidas serão obtidas.
  */
  async getWatchedMedia(username: string): Promise<void> {
    try {
      const media = await firstValueFrom(this.profileService.getUserWatchedMedia(username));
      this.watchedMovies = media.filter(m => m.type === 'movie').reverse();
      this.watchedSeries = media.filter(m => m.type === 'serie').reverse();

      await this.fetchWatchedMediaDetails();
    } catch (error) {
      console.error('Erro ao buscar mídia assistida para utilizador', username, error);
    }
  }

  /**
  * Busca detalhes adicionais para as mídias assistidas previamente obtidas.
  */
  async fetchWatchedMediaDetails(): Promise<void> {
    for (const movie of this.watchedMovies) {
      try {
        const details = await firstValueFrom(this.service.getMovieDetails(movie.mediaId));
        movie.details = details;
      } catch (error) {
        console.error('Erro ao buscar detalhes do filme', error);
      }
    }

    for (const series of this.watchedSeries) {
      try {
        const details = await firstValueFrom(this.service.getSerieDetails(series.mediaId));
        series.details = details;
      } catch (error) {
        console.error('Erro ao buscar detalhes da série', error);
      }
    }
  }

  /*----------------------------------------------------------------  MEDIA A VER ---------------------------------------------------------------- */

  /**
  * Obtém e processa a lista de mídias marcadas para ver mais tarde pelo utilizador, incluindo filmes e séries.
  * Busca detalhes adicionais para cada mídia marcada.
  * 
  * @param username Nome do utilizador cujas mídias para ver mais tarde serão obtidas.
  */
  async getWatchLaterMedia(username: string): Promise<void> {
    try {
      const media = await firstValueFrom(this.profileService.getUserWatchLaterMedia(username));
      this.watchLaterMovies = media.filter(m => m.type === 'movie').reverse();
      this.watchLaterSeries = media.filter(m => m.type === 'serie').reverse();

      await this.fetchWatchLaterMediaDetails();
    } catch (error) {
      console.error('Erro ao buscar mídia para ver mais tarde para o utilizador', username, error);
    }
  }

  /**
  * Busca detalhes adicionais para as mídias marcadas para ver mais tarde previamente obtidas.
  */
  async fetchWatchLaterMediaDetails(): Promise<void> {
    for (const movie of this.watchLaterMovies) {
      try {
        const details = await firstValueFrom(this.service.getMovieDetails(movie.mediaId));
        movie.details = details;
      } catch (error) {
        console.error('Erro ao buscar detalhes do filme para ver mais tarde', error);
      }
    }

    for (const series of this.watchLaterSeries) {
      try {
        const details = await firstValueFrom(this.service.getSerieDetails(series.mediaId));
        series.details = details;
      } catch (error) {
        console.error('Erro ao buscar detalhes da série para ver mais tarde', error);
      }
    }
  }

  /*----------------------------------------------------------------  Favoritos ----------------------------------------------------------------------- */

  getLimitedFavorites(): any[] {
    const combinedFavorites = [];

    let movieCount = 0;
    for (const movie of this.favoriteMovies) {
      if (movieCount < 3) {
        combinedFavorites.push({
          type: 'movie',
          mediaId: movie.mediaId,
          details: movie.details
        });
        movieCount++;
      }
    }

    // Adiciona séries à lista combinada
    let seriesCount = 0;
    for (const series of this.favoriteSeries) {
      if (seriesCount < (6 - movieCount)) { 
        combinedFavorites.push({
          type: 'series',
          mediaId: series.mediaId,
          details: series.details
        });
        seriesCount++;
      }
    }

    return combinedFavorites;
  }



  toggleFavoritesList(): void {
    this.showFavorites = !this.showFavorites;
  }

  toggleMedalsList(): void {
    this.showMedals = !this.showMedals;
  }

  toggleFavoritesListDisplay(): void {
    this.showAllFavorites = !this.showAllFavorites;
  }

  toggleFavoritesScroll(): void {
    this.expandedFavoritesList = !this.expandedFavoritesList;
    this.toggleFollowers();
    this.toggleFollowing();
    this.toggleSeriesWatchedList();
    this.toggleSeriesToWatchList();
    this.toggleMoviesToWatchList();
    this.toggleMoviesWatchedList();
    this.toggleMedalsList();
  }

  /*----------------------------------------------------------------  Filmes já vistos ---------------------------------------------------------------- */

  toggleMoviesWatchedList(): void {
    this.showMoviesWatched = !this.showMoviesWatched;
  }

  toggleMoviesWatchedListDisplay(): void {
    this.showAllMoviesWatched = !this.showAllMoviesWatched;
  }

  toggleWatchedMoviesScroll(): void {
    this.expandedMoviesWatchList = !this.expandedMoviesWatchList;
    this.toggleFollowers();
    this.toggleFollowing();
    this.toggleSeriesWatchedList();
    this.toggleSeriesToWatchList();
    this.toggleMoviesToWatchList();
    this.toggleFavoritesList();
    this.toggleMedalsList();
  }

  /*----------------------------------------------------------------  Filmes a ver -------------------------------------------------------------------- */

  toggleMoviesToWatchList(): void {
    this.showMoviesToWatch = !this.showMoviesToWatch;
  }

  toggleMoviesToWatchListDisplay(): void {
    this.showAllMoviesToWatch = !this.showAllMoviesToWatch;
  }

  toggleToWatchMoviesScroll(): void {
    this.expandedMoviesToWatchList = !this.expandedMoviesToWatchList;
    this.toggleFollowers();
    this.toggleFollowing();
    this.toggleSeriesWatchedList();
    this.toggleMoviesWatchedList();
    this.toggleSeriesToWatchList();
    this.toggleFavoritesList();
    this.toggleMedalsList();
  }

  /*----------------------------------------------------------------  Séries já vistas ---------------------------------------------------------------- */

  toggleSeriesWatchedList(): void {
    this.showSeriesWatched = !this.showSeriesWatched;
  }

  toggleSeriesWatchedListDisplay(): void {
    this.showAllSeriesWatched = !this.showAllSeriesWatched;
  }

  toggleWatchedSeriesScroll(): void {
    this.expandedSeriesWatchList = !this.expandedSeriesWatchList;
    this.toggleFollowers();
    this.toggleFollowing();
    this.toggleMoviesWatchedList();
    this.toggleSeriesToWatchList();
    this.toggleMoviesToWatchList();
    this.toggleFavoritesList();
    this.toggleMedalsList();
  }

  /*----------------------------------------------------------------  Séries a ver -------------------------------------------------------------------- */

  toggleSeriesToWatchList(): void {
    this.showSeriesToWatch = !this.showSeriesToWatch;
  }

  toggleSeriesToWatchListDisplay(): void {
    this.showAllSeriesToWatch = !this.showAllSeriesToWatch;
  }

  toggleToWatchSeriesScroll(): void {
    this.expandedSeriesToWatchList = !this.expandedSeriesToWatchList;
    this.toggleFollowers();
    this.toggleFollowing();
    this.toggleMoviesWatchedList();
    this.toggleSeriesWatchedList();
    this.toggleMoviesToWatchList();
    this.toggleFavoritesList();
    this.toggleMedalsList();
  }

  /* Seguidores */

  toggleFollowers() {
    this.showFollowers = !this.showFollowers;
  }

  toggleFollowersDisplay(): void {
    this.showAllFollowers = !this.showAllFollowers;
  }

  toggleFollowersScroll(): void {
    this.expandedFollowers = !this.expandedFollowers;
    this.toggleFollowersDisplay();
    this.toggleFollowing();
    this.toggleMoviesWatchedList();
    this.toggleSeriesWatchedList();
    this.toggleSeriesToWatchList();
    this.toggleMoviesToWatchList();
    this.toggleFavoritesList();
    this.toggleMedalsList();
  }

  /* A seguir */

  toggleFollowing() {
    this.showFollowing = !this.showFollowing;
  }

  toggleFollowingDisplay(): void {
    this.showAllFollowing = !this.showAllFollowing;
  }

  toggleFollowingScroll(): void {
    this.expandedFollowing = !this.expandedFollowing;
    this.toggleFollowingDisplay();
    this.toggleFollowers();
    this.toggleMoviesWatchedList();
    this.toggleSeriesWatchedList();
    this.toggleSeriesToWatchList();
    this.toggleMoviesToWatchList();
    this.toggleFavoritesList();
    this.toggleMedalsList();
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
  getMedals() {
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
