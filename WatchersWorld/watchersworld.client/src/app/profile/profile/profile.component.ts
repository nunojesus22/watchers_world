import { Component, OnInit } from '@angular/core';
import { ProfileService } from '../services/profile.service';
import { Profile } from '../models/profile';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { Subject, firstValueFrom, takeUntil } from 'rxjs';
import { ActivatedRoute } from '@angular/router';
import { AuthenticationService } from '../../authentication/services/authentication.service';
import { FollowerProfile } from '../models/follower-profile';
import { MovieApiServiceComponent } from '../../media/api/movie-api-service/movie-api-service.component';
import { UserMedia } from '../models/user-media';
import { Title } from '@angular/platform-browser';
import { AdminService } from '../../admin/service/admin.service';
import { NotificationService } from '../../notifications/services/notification.service';
import { GamificationService } from '../../gamification/Service/gamification.service';



interface MovieCategory {
  name: string;
  results: any[];
  activeIndex: number;
  media_type: string;
}

@Component({
  selector: 'app-profile',
  templateUrl: './profile.component.html',
  styleUrl: './profile.component.css'
})
export class ProfileComponent implements OnInit {

  currentUsername: string | undefined; // Nome de usuário do perfil exibido
  loggedUserName: string | null = null; // Nome de usuário do usuário logado
  isFollowing: boolean = false;
  loggedUserProfile: Profile | undefined;
  userPhoto: string | undefined;

  profileForm: FormGroup = new FormGroup({});

  private unsubscribed$ = new Subject<void>();

  message: string | undefined;
  errorMessages: any;

  usersProfiles: Profile[] = [];
  usersProfilesMod: Profile[] = [];


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

  showMedals: boolean = false;

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


  //MODERADOR
  isBanPopupVisible = false;
  isModerator: boolean = false;
  banDuration: number | undefined;
  isBanned?: boolean;
  selectedUserForBan: string | null = null;

  //MEDALHAS
  medals: any[] = [];


  constructor(private profileService: ProfileService,
    private formBuilder: FormBuilder,
    private route: ActivatedRoute, public authService: AuthenticationService,
    private notificationService: NotificationService,
    private service: MovieApiServiceComponent, private title: Title, private adminService: AdminService, 
    private gamificationService: GamificationService) { }

  ngOnInit(): void {

    this.route.params.subscribe(params => {
      if (typeof params['username'] === 'string') {
        this.currentUsername = params['username'];

        //this.getUserProfileInfo(this.currentUsername).then(() => {
        //  // Aqui você tem certeza de que as informações do perfil foram carregadas
        //  if (this.loggedUserProfile) {
        //    this.canViewFollowers = this.loggedUserProfile.profileStatus === 'Public' || this.isFollowing;
        //  }
        //});
      }

      this.authService.user$.subscribe(user => {
        this.loggedUserName = user ? user.username : null; // Obtenha o nome de usuário do usuário logado
        // Certifique-se de que currentUsername é uma string antes de chamar includes
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
        this.getMedals(this.currentUsername);
      }


    });

    this.getUserProfilesMod();
    this.getUserProfiles();
    this.initializeForm();
    this.categories = [
      { name: 'Trending Movies', results: [], activeIndex: 0, media_type: "movie" },
    ];

    this.fetchTrending();
  }

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

  ngOnDestroy(): void {
    this.unsubscribed$.next();
    this.unsubscribed$.complete();
  }

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

  private loadUserRole() {
    // Assuming the AuthService is keeping track of the current user's username
    const currentUsername = this.authService.getLoggedInUserName();
    if (currentUsername) {
      this.authService.getUserRole(currentUsername).subscribe(roles => {
        this.isModerator = roles.includes('Moderator');
      }, error => {
        console.error('Error fetching roles:', error);
      });
    }
  }


  initializeForm() {
    this.profileForm = this.formBuilder.group({
      hobby: [''],
      gender: ['', { disabled: true }],
      date: [''],
    });
  }

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

  setFormFields(username: string) {
    const userName = document.querySelector("h1");
    this.profileForm.get('gender')?.disable();
    this.profileService.getUserData(username)
      .pipe(takeUntil(this.unsubscribed$))
      .subscribe({
        next: (userData: Profile) => {
          if (userName) { userName.textContent = username; }
          this.profileForm.patchValue({
            hobby: userData.description || "Por definir",
            gender: userData.gender || "Por definir",
            date: userData.birthDate ? new Date(userData.birthDate).toISOString().split('T')[0] : '',
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

  checkFollowingStatus(usernameAuthenticated: string, usernameToCheck: string): void {
    this.profileService.alreadyFollows(usernameAuthenticated, usernameToCheck).subscribe(isFollowing => {
      this.isFollowing = isFollowing;
    }, error => {
      console.error('Erro ao verificar o status de seguimento', error);
    });
  }

  requestToFollow(): void {
    this.followRequestSent = true;
  }

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
          console.error('Erro ao seguir usuário', error);
        }
      });
    } else {
      console.error('Nome de usuário atual ou nome de usuário logado está indefinido.');
    }
  }

  unfollowUser(): void {
    if (this.currentUsername && this.loggedUserName) {
      this.profileService.unfollowUser(this.loggedUserName, this.currentUsername)
        .subscribe({
          next: () => {
            this.isFollowing = false;
          },
          error: (error) => {
            console.error('Erro ao deixar de seguir usuário', error);
          }
        });
    } else {
      console.error('Os nomes de usuário do perfil logado ou do perfil a ser seguido não estão definidos.');
    }
  }

  getRandomFollowslist(array: FollowerProfile[], size: number): FollowerProfile[] {
    // Cria uma cópia do array para não modificar o original
    const arrayCopy = [...array];
    // Embaralha a cópia do array
    for (let i = arrayCopy.length - 1; i > 0; i--) {
      const j = Math.floor(Math.random() * (i + 1));
      [arrayCopy[i], arrayCopy[j]] = [arrayCopy[j], arrayCopy[i]];
    }
    // Retorna os primeiros `size` elementos do array embaralhado
    return arrayCopy.slice(0, size);
  }

  getFollowersList(): void {
    if (this.currentUsername) {
      this.profileService.getFollowers(this.currentUsername).subscribe(followers => {
        this.followers = this.getRandomFollowslist(followers, followers.length);
      }, error => {
        console.error("Error while fetching followers:", error);
      });
    }
  }


  getFollowingList(): void {
    if (this.currentUsername) {
      this.profileService.getFollowing(this.currentUsername).subscribe(following => {
        // Em vez de atribuir diretamente, passa pelo método getRandomSublist
        this.following = this.getRandomFollowslist(following, following.length);
      }, error => {
        console.error("Error while fetching following:", error);
      });
    }
  }

  getRandomOtherUsers(array: Profile[], size: number): Profile[] {
    // Cria uma cópia do array para não modificar o original
    const arrayCopy = [...array];
    // Embaralha a cópia do array
    for (let i = arrayCopy.length - 1; i > 0; i--) {
      const j = Math.floor(Math.random() * (i + 1));
      [arrayCopy[i], arrayCopy[j]] = [arrayCopy[j], arrayCopy[i]];
    }
    // Retorna os primeiros `size` elementos do array embaralhado
    return arrayCopy.slice(0, size);
  }

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


  async getFavorites(username: string): Promise<void> {
    try {
      const favorites = await firstValueFrom(this.profileService.getFavoriteMedia(username));

      this.favoriteMovies = favorites.filter(m => m.type === 'movie');
      this.favoriteSeries = favorites.filter(m => m.type === 'serie');

      for (const movie of this.favoriteMovies) {
        try {
          const details = await firstValueFrom(this.service.getMovieDetails(movie.mediaId));
          movie.details = details; // Adicionando detalhes ao objeto movie
        } catch (error) {
          console.error('Erro ao buscar detalhes do filme favorito', error);
        }
      }

      // Buscar detalhes para séries favoritas
      for (const series of this.favoriteSeries) {
        try {
          const details = await firstValueFrom(this.service.getSerieDetails(series.mediaId));
          series.details = details; // Adicionando detalhes ao objeto series
        } catch (error) {
          console.error('Erro ao buscar detalhes da série favorita', error);
        }
      }
    } catch (error) {
      console.error('Erro ao buscar mídia favorita para usuário', username, error);
    }
  }


  /*----------------------------------------------------------------  MEDIA JÁ VISTA ---------------------------------------------------------------- */

  async getWatchedMedia(username: string): Promise<void> {
    try {
      const media = await firstValueFrom(this.profileService.getUserWatchedMedia(username));
      this.watchedMovies = media.filter(m => m.type === 'movie').reverse();
      this.watchedSeries = media.filter(m => m.type === 'serie').reverse();

      await this.fetchWatchedMediaDetails();
    } catch (error) {
      console.error('Erro ao buscar mídia assistida para usuário', username, error);
    }
  }

  async fetchWatchedMediaDetails(): Promise<void> {
    // Buscar detalhes dos filmes
    for (const movie of this.watchedMovies) {
      try {
        const details = await firstValueFrom(this.service.getMovieDetails(movie.mediaId));
        movie.details = details; // Aqui você pode querer criar uma nova propriedade para guardar os detalhes
      } catch (error) {
        console.error('Erro ao buscar detalhes do filme', error);
      }
    }

    // Buscar detalhes das séries
    for (const series of this.watchedSeries) {
      try {
        const details = await firstValueFrom(this.service.getSerieDetails(series.mediaId));
        series.details = details; // Similarmente aqui
      } catch (error) {
        console.error('Erro ao buscar detalhes da série', error);
      }
    }
  }

  /*----------------------------------------------------------------  MEDIA A VER ---------------------------------------------------------------- */

  async getWatchLaterMedia(username: string): Promise<void> {
    try {
      const media = await firstValueFrom(this.profileService.getUserWatchLaterMedia(username));
      this.watchLaterMovies = media.filter(m => m.type === 'movie').reverse();
      this.watchLaterSeries = media.filter(m => m.type === 'serie').reverse();

      await this.fetchWatchLaterMediaDetails();
    } catch (error) {
      console.error('Erro ao buscar mídia para ver mais tarde para o usuário', username, error);
    }
  }

  async fetchWatchLaterMediaDetails(): Promise<void> {
    // Buscar detalhes dos filmes para ver mais tarde
    for (const movie of this.watchLaterMovies) {
      try {
        const details = await firstValueFrom(this.service.getMovieDetails(movie.mediaId));
        movie.details = details; // Aqui você pode querer criar uma nova propriedade para guardar os detalhes
      } catch (error) {
        console.error('Erro ao buscar detalhes do filme para ver mais tarde', error);
      }
    }

    // Buscar detalhes das séries para ver mais tarde
    for (const series of this.watchLaterSeries) {
      try {
        const details = await firstValueFrom(this.service.getSerieDetails(series.mediaId));
        series.details = details; // Similarmente aqui
      } catch (error) {
        console.error('Erro ao buscar detalhes da série para ver mais tarde', error);
      }
    }
  }

  /*----------------------------------------------------------------  Favoritos ----------------------------------------------------------------------- */

  toggleFavoritesList(): void {
    this.showFavorites = !this.showFavorites;
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
    this.toggleSeriesToWatchList();
    this.toggleMoviesToWatchList();
    this.toggleFavoritesList();

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

  }

  toggleAllFiveOtherUsers(): void {
    this.showFiveOtherUsers = !this.showFiveOtherUsers;
  }

  toggleExpandedSuggestions() {
    this.showExpandedSuggestions = !this.showExpandedSuggestions;
  }


  //--------------------------------------------------MEDALHAS-------------------------------------------------------------------

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
  


  //--------------------------------------------------MODERADOR------------------------------------------------------------------
  checkIfUserIsBanned(profile: Profile): boolean {
    // Directly return the isBanned status from the profile
    // If the property could be undefined, provide a default value
    return profile.isBanned ?? false;
  }


  banTemp(username: string | null): void {
    if (!username) {
      console.error('Username is undefined, cannot ban user temporarily.');
      return;
    }
    if (this.banDuration == null || this.banDuration <= 0) {
      console.error('Ban duration is not specified or is invalid.');
      return;
    }
    console.log(`Attempting to ban user temporarily: ${username} for ${this.banDuration} days`);

    this.adminService.BanUserTemporarily(username, this.banDuration).subscribe({
      next: () => {
        console.log(`User banned temporarily for ${this.banDuration} days`);
        const user = this.usersProfiles?.find(u => u.userName === username);
        this.hideBanPopup();
        if (user) {
          user.isBanned = true;
          // This will trigger change detection and update the UI
          this.usersProfiles = [...this.usersProfiles!];
        }
      },
      error: error => {
        console.error("Error banning user temporarily:", error);
      }
    });
  }



  banPerm(username: string | null): void {
    if (!username) {
      console.error('Username is undefined, cannot ban user.');
      return;
    }
    console.log(`Attempting to ban user permanently: ${username}`);

    this.adminService.banUserPermanently(username).subscribe({
      next: () => {
        console.log('User banned permanently');
        const user = this.usersProfiles?.find(u => u.userName === username);
        this.hideBanPopup();
        if (user) {
          user.isBanned = true;
          // This will trigger change detection and update the UI
          this.usersProfiles = [...this.usersProfiles!];
        }
      },
      error: error => {
        console.error("Error banning user:", error);
      }
    });
  }

  unban(username: string | undefined): void {
    if (!username) {
      console.error('Username is undefined, cannot unban user.');
      return;
    }
    this.adminService.unbanUser(username).subscribe({
      next: (response) => {
        console.log(response.message);
        const user = this.usersProfiles?.find(u => u.userName === username);
        if (user) {
          user.isBanned = false;
        }
        // This will trigger change detection and update the UI
        this.usersProfiles = [...this.usersProfiles!];
      },
      error: (error) => {
        console.error("Error unbanning user:", error);
      }
    });
  }

  showBanPopup(username: string): void {
    this.selectedUserForBan = username;
    this.isBanPopupVisible = true; // This should show the popup
  }

  hideBanPopup(): void {
    this.isBanPopupVisible = false;
    this.selectedUserForBan = null; // Clear the selected user
  }

  getUserProfilesMod() {
    this.profileService.getUserProfiles().pipe(takeUntil(this.unsubscribed$)).subscribe(
      (profiles: Profile[]) => {
        const currentUsername = this.authService.getLoggedInUserName();
        // Filter out the logged-in user's profile from the list
        this.usersProfilesMod = profiles.filter(profile => profile.userName !== currentUsername);
      },
      (error) => {
        console.error("Error while fetching users' profiles:", error);
      }
    );
  }
}
