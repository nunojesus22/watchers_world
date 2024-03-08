import { Component, OnInit } from '@angular/core';
import { ProfileService } from '../services/profile.service';
import { Profile } from '../models/profile';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { Subject, takeUntil } from 'rxjs';
import { ActivatedRoute } from '@angular/router';
import { AuthenticationService } from '../../authentication/services/authentication.service';
import { FollowerProfile } from '../models/follower-profile';
import { MovieApiServiceComponent } from '../../movie-api-service/movie-api-service.component';

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

  profileForm: FormGroup = new FormGroup({});

  private unsubscribed$ = new Subject<void>();

  message: string | undefined;
  errorMessages: any;

  usersProfiles: Profile[] = [];

  followersCount: number | undefined;
  followingCount: number | undefined;

  canViewFollowers: boolean = false;

  showMediaDetails: boolean = true;
  showFollowers: boolean = true;
  showFollowing: boolean = true;
  showFavorites: boolean = false;
  showMovies: boolean = false;
  showSeries: boolean = false;
  showMedals: boolean = false;

  expandedFollowers: boolean = false;
  expandedFollowing: boolean = false;

  followers: FollowerProfile[] = [];
  following: FollowerProfile[] = [];

  showAllFollowing = false;
  showAllFollowers = false;
  showFiveOtherUsers = false;
  showExpandedSuggestions = false;

  categories: MovieCategory[] = [];

  constructor(private profileService: ProfileService,
    private formBuilder: FormBuilder,
    private route: ActivatedRoute, public authService: AuthenticationService,
    private service: MovieApiServiceComponent) { }

  ngOnInit(): void {
    this.route.params.subscribe(params => {
      if (typeof params['username'] === 'string') {
        this.currentUsername = params['username'];

        this.getUserProfileInfo(this.currentUsername).then(() => {
          // Aqui você tem certeza de que as informações do perfil foram carregadas
          if (this.loggedUserProfile) {
            this.canViewFollowers = this.loggedUserProfile.profileStatus === 'Public' || this.isFollowing;
          }
        });
      }

      this.authService.user$.subscribe(user => {
        this.loggedUserName = user ? user.username : null; // Obtenha o nome de usuário do usuário logado
        // Certifique-se de que currentUsername é uma string antes de chamar includes
        if (this.currentUsername && this.loggedUserName && this.currentUsername !== this.loggedUserName) {
          this.checkFollowingStatus(this.loggedUserName, this.currentUsername);
        }
      });



      if (this.currentUsername) {
        this.getUserProfileInfo(this.currentUsername);
        this.setFormFields(this.currentUsername);
        this.setImages(this.currentUsername);
        this.getFollowersList();
        this.getFollowingList();
      }
    });
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

  // A função getUserProfileInfo deve retornar uma Promise agora
  getUserProfileInfo(username: string): Promise<void> {
    return new Promise((resolve, reject) => {
      this.profileService.getUserData(username).subscribe({
        next: (userData: Profile) => {
          if (this.loggedUserName !== null) {
            this.followersCount = userData.followers;
            this.followingCount = userData.following;
            this.canViewFollowers = userData.profileStatus === 'Public' || this.isFollowing;
          }
          resolve();
        },
        error: (error) => {
          console.error("Error while fetching user data:", error);
          reject();
        }
      });
    });
  }

  initializeForm() {
    this.profileForm = this.formBuilder.group({
      hobby: [''],
      gender: ['', {disabled:true}],
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

  followUser(): void {
    if (this.currentUsername && this.loggedUserName) {
      this.profileService.followUser(this.loggedUserName, this.currentUsername)
        .subscribe({
          next: (response) => {
            this.isFollowing = true;
            console.log(this.isFollowing);
            // this.getFollowers(this.currentUsername);
            console.log('Usuário seguido com sucesso!', response.message);
          },
          error: (error) => {
            console.error('Erro ao seguir usuário', error);
          }
        });
    } else {
      console.error('Os nomes de usuário do perfil logado ou do perfil a ser seguido não estão definidos.');
    }
  }

  unfollowUser(): void {
    if (this.currentUsername && this.loggedUserName) {
      this.profileService.unfollowUser(this.loggedUserName, this.currentUsername)
        .subscribe({
          next: (response) => {
            this.isFollowing = false;
            console.log(this.isFollowing);
            // this.getFollowers(this.currentUsername);
            console.log('Usuário deixado de seguir com sucesso!', response.message);
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

  toggleMediaDetails(): void {
    this.showMediaDetails = !this.showMediaDetails;
  }

  toggleFollowers() {
    this.showFollowers = !this.showFollowers;
  }

  toggleFollowersDisplay(): void {
    this.showAllFollowers = !this.showAllFollowers;
  }


  toggleFollowing() {
    this.showFollowing = !this.showFollowing;
  }

  toggleFollowingDisplay(): void {
    this.showAllFollowing = !this.showAllFollowing;
  }

  toggleMediaAndFollowing() {
    this.toggleMediaDetails();
    this.toggleFollowing();
  }

  toggleMediaAndFollowers() {
    this.toggleMediaDetails();
    this.toggleFollowers();
  }

  toggleFollowersScroll(): void {
    this.expandedFollowers = !this.expandedFollowers;
    this.toggleMediaAndFollowing();
    this.toggleFollowersDisplay();
  }

  toggleFollowingScroll(): void {
    this.expandedFollowing = !this.expandedFollowing;
    this.toggleMediaAndFollowers();
    this.toggleFollowingDisplay();
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

  toggleAllFiveOtherUsers(): void {
    this.showFiveOtherUsers = !this.showFiveOtherUsers;
  }

  toggleExpandedSuggestions() {
    this.showExpandedSuggestions = !this.showExpandedSuggestions;
  }
}
