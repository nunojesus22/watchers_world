import { Component, OnInit } from '@angular/core';
import { ProfileService } from '../services/profile.service';
import { Profile } from '../models/profile';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { Subject, takeUntil } from 'rxjs';
import { ActivatedRoute } from '@angular/router';
import { AuthenticationService } from '../../authentication/services/authentication.service';


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

  usersProfiles: Profile[] | undefined;
  followers!: string[];
  following!: string[];
  followersCount: number | undefined;
  followingCount: number | undefined;

  constructor(private profileService: ProfileService,
    private formBuilder: FormBuilder,
    private route: ActivatedRoute, public authService: AuthenticationService,) { }

  ngOnInit(): void {
    this.route.params.subscribe(params => {
      this.currentUsername = params['username']; // Nome de usuário do perfil exibido

      this.authService.user$.subscribe(user => {
        this.loggedUserName = user ? user.username : null; // Obtenha o nome de usuário do usuário logado
        // Certifique-se de que currentUsername é uma string antes de chamar includes
        if (typeof this.currentUsername === 'string' && this.loggedUserName && typeof this.isFollowing) {
          this.isFollowing = this.loggedUserProfile?.following.includes(this.currentUsername) ?? false;
        }
      });

      if (this.currentUsername) {
        this.getUserProfileInfo(this.currentUsername);
        this.setFormFields(this.currentUsername);
        this.setImages(this.currentUsername);
      }
    });
    this.initializeForm();
    this.getUserProfiles();
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
            this.isFollowing = userData.followers.includes(this.loggedUserName);
            this.followers = userData.followers;
            this.following = userData.following;
            this.followersCount = userData.followers.length;
            this.followingCount = userData.following.length;

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
      gender: [''],
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
          this.followersCount = userData.followers.length;
          this.followingCount = userData.following.length;
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

  followUser(): void {
    // Verifique se currentUsername é uma string antes de fazer a chamada
    if (typeof this.currentUsername === 'string') {
      // Aqui chamamos followUser com o nome de usuário do perfil exibido
      this.profileService.followUser(this.currentUsername)
        .subscribe({
          next: () => {
            this.isFollowing = true;
            console.log('Usuário seguido com sucesso!');
          },
          error: (error) => {
            console.error('Erro ao seguir usuário', error);
          }
        });
    } else {
      console.error('O nome de usuário do perfil não está definido.');
    }
  }

  unfollowUser(): void {
    if (typeof this.currentUsername === 'string') {
      this.profileService.unfollowUser(this.currentUsername)
        .subscribe({
          next: () => {
            this.isFollowing = false;
            console.log('Usuário deixado de seguir com sucesso!');
          },
          error: (error) => {
            console.error('Erro ao deixar de seguir usuário', error);
          }
        });
    } else {
      console.error('O nome de usuário do perfil não está definido.');
    }
  }

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
}
