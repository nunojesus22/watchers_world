import { Component, OnInit } from '@angular/core';
import { ProfileService } from '../services/profile.service';

@Component({
  selector: 'app-profile',
  templateUrl: './profile.component.html',
  styleUrl: './profile.component.css'
})
export class ProfileComponent implements OnInit{

  message: string | undefined;

  constructor(private profileService : ProfileService){}

  ngOnInit(): void {
    this.profileService.getProfile().subscribe({
      next: (response: any) => this.message = response.value.message,
      error: error => console.log(error)
    });
  }
}
