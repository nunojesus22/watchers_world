import { Component, ViewChild } from '@angular/core';
import { FormBuilder, FormGroup } from '@angular/forms';
import { Subject, switchMap, takeUntil } from 'rxjs';
import { Profile } from '../models/profile';
import { ProfileService } from '../services/profile.service';

@Component({
  selector: 'app-edit-profile',
  templateUrl: './edit-profile.component.html',
  styleUrls: ['./edit-profile.component.css']
})
export class EditProfileComponent {
  profileForm: FormGroup = new FormGroup({});

  private unsubscribed$ = new Subject<void>();

  message: string | undefined;
  errorMessages: any;
  hobbyEditable = false;
  genderEditable = false;
  birthdateEditable = false;
  nameEditable = false; // Variable to control the editability of the name
  profileLocked = false;
  isDateEditable: boolean = false;
  //fotos
  coverPhoto: string = 'assets/img/pfp2.png';
  profilePhoto: string = 'assets/img/joao-pfp.png';
  constructor(private profileService: ProfileService, private formBuilder: FormBuilder) { }

  toggleEdit(field: string) {
    switch (field) {
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

  private toggleFormControl(controlName: string, isEditable: boolean) {
    if (isEditable) {
      this.profileForm.get(controlName)?.enable();
    } else {
      this.profileForm.get(controlName)?.disable();
    }
  }

  toggleLock() {
    const newLockStatus = !this.profileLocked;
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
      const reader = new FileReader();

      reader.onload = (e: any) => {
        // Use a dynamic key to update the property
        (this as any)[target] = e.target.result;
      };

      reader.readAsDataURL(file);
    } else {
      console.error("Target not specified for changeImage");
    }
  }


  ngOnInit(): void {
    this.initializeForm();
    this.setFormFields();
    this.setImages();
  }

  ngOnDestroy(): void {
    this.unsubscribed$.next();
    this.unsubscribed$.complete();
  }

  getUserProfileInfo() {
    this.profileService.getUserData().subscribe({
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

  setImages() {
    this.profileService.getUserData().pipe(takeUntil(this.unsubscribed$)).subscribe(
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

  setFormFields() {
    const userName = document.querySelector("h1");
    this.profileForm.get('gender')?.disable();
    this.profileService.getUserData().pipe(takeUntil(this.unsubscribed$)).subscribe(
      (userData: Profile) => {
        if (userName != undefined) { userName.textContent = userData.userName.toUpperCase(); }
        this.profileForm.patchValue({
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

  updateFormFields() {
    const hobby = this.profileForm.get('hobby')?.value;
    const gender = this.profileForm.get('gender')?.value;
    const date = this.profileForm.get('date')?.value;

    const data = new Profile(date, hobby, gender, "assets/img/joao-pfp.png", "assets/img/pfp2.png");
    
    console.log(data);
    console.log(this.profileForm.valid);
    if (this.profileForm.valid) {
      this.profileService.setUserData(data).subscribe({
        next: (response: any) => {
          console.log(response);
          this.setFormFields();
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

  updatePhotos() {
    const coverphoto = document.querySelector(".cover-photo");
    const profilephoto = document.querySelector(".profile-photo");

  }


  updateStatus() {
    
  }

  saveButton() {
    this.updateFormFields();
  }


}
