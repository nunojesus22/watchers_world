import { Component } from '@angular/core';
import { Subject, takeUntil } from 'rxjs';
import { ProfileService } from '../profile/services/profile.service';
import { AuthenticationService } from '../authentication/services/authentication.service';
import { Profile } from '../profile/models/profile';
import { ActivatedRoute, Router } from '@angular/router';


@Component({
  selector: 'app-notifications',
  templateUrl: './notifications.component.html',
  styleUrl: './notifications.component.css'
})
export class NotificationsComponent {
  currentUsername: string | undefined; 
  isBanPopupVisible = false;
  unsubscribed$: Subject<void> = new Subject<void>();
  usersProfiles: Profile[] | undefined;
  loggedUserName: string | null = null;
  selectedUserForBan: string | null = null;
  banDuration: number | undefined;

  constructor(private profileService: ProfileService, public authService: AuthenticationService, private route: ActivatedRoute) { }

  ngOnInit(): void {
    this.route.params.subscribe(params => {
      if (typeof params['username'] === 'string') {
        this.currentUsername = params['username'];
      }
    });
    this.getUserProfiles();

    this.loggedUserName = this.authService.getLoggedInUserName();
    // Fetch user profiles
    this.getUserProfiles();
  }

  ngOnDestroy() {
    this.unsubscribed$.next();
    this.unsubscribed$.complete();
  }

  getUserProfiles() {
    this.profileService.getUserProfiles().pipe(takeUntil(this.unsubscribed$)).subscribe(
      (profiles: Profile[]) => {
        // Filter out the logged-in user from the profiles
        this.usersProfiles = profiles.filter(profile => profile.userName !== this.loggedUserName);
      },
      (error) => {
        console.error("Error while fetching users' profiles:", error);
      }
    );
  }












 

}
