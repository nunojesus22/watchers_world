import { Component, ViewChild } from '@angular/core';
import { FormBuilder, FormGroup } from '@angular/forms';
import { Subject, switchMap, take, takeUntil } from 'rxjs';
import { Profile } from '../models/profile';
import { ProfileService } from '../services/profile.service';
import { User } from '../../authentication/models/user';
import { AuthenticationService } from '../../authentication/services/authentication.service';
import { ActivatedRoute, Router } from '@angular/router';

@Component({
  selector: 'app-edit-profile',
  templateUrl: './edit-profile.component.html',
  styleUrls: ['./edit-profile.component.css']
})
export class EditProfileComponent {
  profileForm: FormGroup = new FormGroup({});

  private unsubscribed$ = new Subject<void>();
  usersProfiles: Profile[] | undefined;
  message: string | undefined;
  errorMessages: any;
  userNameEditable = false;
  hobbyEditable = false;
  genderEditable = false;
  birthdateEditable = false;
  nameEditable = false; // Variable to control the editability of the name
  isDateEditable: boolean = false;
  userName: string = "NOME UTILIZADOR";
  coverPhoto: string = "";
  profilePhoto: string = "";
  profileLockedPhoto: string = 'assets/img/private.png';
  profileUnlockedPhoto: string = 'assets/img/public.png';
  isProfileLocked: boolean = false;
  profileLocked: string = "Public";

  showFavorites: boolean = false;
  showMovies: boolean = false;
  showSeries: boolean = false;
  showMedals: boolean = false;

  constructor(private profileService: ProfileService,
    private formBuilder: FormBuilder,
    private route: ActivatedRoute, public authService: AuthenticationService, private router: Router) { }

  ngOnInit(): void {
    this.route.params.subscribe(params => {
      const userName = params['username'];
      this.getUserProfileInfo(userName);
      this.setFormFields(userName);
      this.setImages(userName);
    });
    this.initializeForm();
    this.getUserProfiles();
  }

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
      // Handle default case or throw an error
    }
  }

  getUserProfiles() {
    this.profileService.getUserProfiles().pipe(takeUntil(this.unsubscribed$)).subscribe(
      (profiles: Profile[]) => {
        this.usersProfiles = profiles;
      },
      (error) => {
        console.error("Error while fetching users' profiles:", error);
        // Handle error as needed
      }
    );
  }

  private toggleFormControl(controlName: string, isEditable: boolean) {
    if (isEditable) {
      this.profileForm.get(controlName)?.enable();
    } else {
      this.profileForm.get(controlName)?.disable();
    }
  }

  toggleLock() {
    this.isProfileLocked = !this.isProfileLocked;
    console.log(this.isProfileLocked);
    this.profileLocked= this.profileLocked === "Public" ? "Private" : "Public";
    console.log(this.profileLocked);
  }

  openFileInput(target: string) {
    const fileInput = document.getElementById('fileInput') as HTMLInputElement | null;

    if (fileInput) {
      // Set a data attribute to identify the target image in the changeImage function
      fileInput.setAttribute('data-target', target);
      fileInput.click();
    } else {
      console.error("File input element not found");
    }
  }

  changeImage(event: any) {
    const fileInput = event.target;
    const target = fileInput.getAttribute('data-target');

    if (target) {
      const file = (fileInput.files as FileList)[0];

      // Use FileReader para obter a Data URL do arquivo selecionado
      const reader = new FileReader();
      reader.onload = (e: any) => {
        // Verifique se o target foi 'profilePhoto' ou 'coverPhoto'
        // e atualize a respectiva propriedade com a Data URL da imagem.
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

  ngOnDestroy(): void {
    this.unsubscribed$.next();
    this.unsubscribed$.complete();
  }

  getUserProfileInfo(username:string) {
    this.profileService.getUserData(username).subscribe({
      next: (response: Profile) => {
        console.log(response);
        return response;
      },
      error: (error) => {
        console.log(error);
        return error;
      }
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


  initializeForm() {
    this.profileForm = this.formBuilder.group({
      hobby: [{ value: ''}],
      gender: [''],
      date: [{ value: ''}],
      name: [{ value: ''}]
    });
  }

  setFormFields(username: string) {
    //const userName = document.querySelector("h1");
    this.profileForm.get('gender')?.disable();
    this.profileService.getUserData(username).pipe(takeUntil(this.unsubscribed$)).subscribe(
      (userData: Profile) => {
        //if (userName != undefined) { userName.textContent = userData.userName.toUpperCase(); }
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

  updateFormFields(username: string) {
    const userName = this.profileForm.get('name')?.value;
    const hobby = this.profileForm.get('hobby')?.value;
    const gender = this.profileForm.get('gender')?.value;
    const date = this.profileForm.get('date')?.value;
    const profilePhoto = this.profilePhoto;
    const coverPhoto = this.coverPhoto;
    const profileStatus = this.profileLocked;
    
    const data = new Profile(date, hobby, gender, profilePhoto, coverPhoto, profileStatus);
    
    console.log(data);
    console.log(this.profileForm.valid);
    if (this.profileForm.valid) {
      this.profileService.setUserData(data).subscribe({
        next: (response: any) => {
          console.log(response);
          this.setFormFields(username);
          console.log(data);
          console.log(response.value.message);
        },
        error: (error) => {
          console.log(error);
          if (error.error.errors) {
            this.errorMessages = error.error.errors;
          } else {
            this.errorMessages.push(error.error);
          }
        }
      },
      );
    }

  }

  saveButton(username: string) {
    this.updateFormFields(username);
  }
  
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
}
