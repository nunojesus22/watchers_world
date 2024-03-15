import { Component } from '@angular/core';
import { Subject, takeUntil } from 'rxjs';
import { ProfileService } from '../profile/services/profile.service';
import { AuthenticationService } from '../authentication/services/authentication.service';
import { Profile } from '../profile/models/profile';
import { ActivatedRoute, Router } from '@angular/router';
import { FollowerProfile } from '../profile/models/follower-profile';


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
  pendingFollowRequests: FollowerProfile[] = [];

  constructor(private profileService: ProfileService, public authService: AuthenticationService, private route: ActivatedRoute) { }

  ngOnInit(): void {
    this.route.params.subscribe(params => {
      if (typeof params['username'] === 'string') {
        this.currentUsername = params['username'];
      }
    });
    this.loggedUserName = this.authService.getLoggedInUserName();
    this.getPendingFollowRequests();
  }

  ngOnDestroy() {
    this.unsubscribed$.next();
    this.unsubscribed$.complete();
  }

  getPendingFollowRequests() {
    if (this.loggedUserName) {
      this.profileService.getPendingFollowRequests(this.loggedUserName)
        .pipe(takeUntil(this.unsubscribed$))
        .subscribe({
          next: (profiles: FollowerProfile[]) => {
            this.pendingFollowRequests = profiles;
          },
          error: (error) => {
            console.error('Error fetching pending follow requests:', error);
          }
        });
    }
  }

  acceptFollowRequest(usernameWhoSend: string) {
    if (this.loggedUserName) {
      this.profileService.acceptFollowRequest(this.loggedUserName, usernameWhoSend)
        .subscribe({
          next: () => {
            // Remove the accepted user from the pendingFollowRequests list
            this.pendingFollowRequests = this.pendingFollowRequests.filter(profile => profile.username !== usernameWhoSend);
            // Additional UI feedback or actions can be done here
          },
          error: (error) => {
            console.error('Error accepting follow request:', error);
          }
        });
    }
  }

  rejectFollowRequest(usernameWhoSend: string) {
    if (this.loggedUserName) {
      this.profileService.rejectFollowRequest(this.loggedUserName, usernameWhoSend)
        .subscribe({
          next: () => {
            // Remove the rejected user from the pendingFollowRequests list
            this.pendingFollowRequests = this.pendingFollowRequests.filter(profile => profile.username !== usernameWhoSend);
            // Additional UI feedback or actions can be done here
          },
          error: (error) => {
            console.error('Error rejecting follow request:', error);
          }
        });
    }
  }












 

}
