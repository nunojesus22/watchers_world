import { Component, ViewChild } from '@angular/core';
import { FormBuilder, FormGroup } from '@angular/forms';
import { Subject, takeUntil } from 'rxjs';
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
        this.toggleFormControl('birthdate', this.birthdateEditable);
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
    this.profileLocked = !this.profileLocked;
  }

  ngOnInit(): void {
    this.initializeForm();
    this.setFormFields();
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

  initializeForm() {
    this.profileForm = this.formBuilder.group({
      hobby: [{ value: '', disabled: !this.hobbyEditable }],
      gender: [''],
      date: [{ value: '', disabled: !this.birthdateEditable }],
      name: [{ value: '', disabled: !this.nameEditable }]
    });
  }

  setFormFields() {
    const userName = document.querySelector("h1");
    this.profileForm.get('gender')?.disable();
    this.profileService.getUserData().pipe(takeUntil(this.unsubscribed$)).subscribe(
      (userData: Profile) => {
        if (userName) { userName.textContent = userData.userName.toUpperCase(); }
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
}
