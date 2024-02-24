import { Component, OnInit } from '@angular/core';
import { ProfileService } from '../services/profile.service';
import { Profile } from '../models/profile';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { Subject, takeUntil } from 'rxjs';

@Component({
  selector: 'app-profile',
  templateUrl: './profile.component.html',
  styleUrl: './profile.component.css'
})
export class ProfileComponent implements OnInit {
  profileForm: FormGroup = new FormGroup({});

  private unsubscribed$ = new Subject<void>();

  message: string | undefined;
  errorMessages: any;

  constructor(private profileService: ProfileService, private formBuilder: FormBuilder) { }

  ngOnInit(): void {
    //this.profileService.getProfile().subscribe({
    //  next: (response: any) => this.message = response.value.message,
    //  error: error => console.log(error)
    //});
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
    },
    );
  }

  initializeForm() {
    this.profileForm = this.formBuilder.group({
      hobby: [''],
      gender: [''],
      date: [''],
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
