import { Component, OnDestroy } from '@angular/core';
import { Subject } from 'rxjs';
import { takeUntil } from 'rxjs/operators';
import { Profile } from '../profile/models/profile';
import { ProfileService } from '../profile/services/profile.service';
import { AuthenticationService } from '../authentication/services/authentication.service';


@Component({
  selector: 'app-admin',
  templateUrl: './admin.component.html',
  styleUrls: ['./admin.component.css']
})
export class AdminComponent implements OnDestroy {
  isBanPopupVisible = false;
  unsubscribed$: Subject<void> = new Subject<void>();
  usersProfiles: Profile[] | undefined;
  loggedUserName: string | null = null;
  selectedUserForBan: string | null = null;
  banDuration: number | undefined;

  constructor(private profileService: ProfileService, private authService: AuthenticationService) { }

  ngOnInit(): void {
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
    // Call the service method and pass the username and this.banDuration
    this.profileService.BanUserTemporarily(username, this.banDuration).subscribe(
      () => {
        console.log(`User banned temporarily for ${this.banDuration} days`);
        // Update UI here if needed
      },
      error => {
        console.error("Error banning user temporarily:", error);
      }
    );
  }



  banPerm(username: string | null): void {
    if (!username) {
      console.error('Username is undefined, cannot ban user.');
      return;
    }
    console.log(`Attempting to ban user permanently: ${username}`);
    this.profileService.banUserPermanently(username).subscribe(
      () => {
        console.log('User banned permanently');
        // You may want to update your UI here to reflect the ban status
      },
      error => {
        console.error("Error banning user:", error);
      }
    );
  }




  deleteAccount(username: string | undefined): void {
    if (!username) {
      console.error('Username is undefined, cannot delete account.');
      return;
    }
    console.log(`Attempting to delete user: ${username}`); // This should appear in your browser's console when you click the delete button
    this.profileService.deleteUserByUsername(username).subscribe(
      () => {
        this.usersProfiles = this.usersProfiles?.filter(user => user.userName !== username);
        console.log('User deleted successfully');
      },
      error => {
        console.error("Error deleting user:", error);
      }
    );
  }




  unban() {

  }

  showBanPopup(username: string): void {
    this.selectedUserForBan = username;
    this.isBanPopupVisible = true; // This should show the popup
  }

  hideBanPopup(): void {
    this.isBanPopupVisible = false;
    this.selectedUserForBan = null; // Clear the selected user
  }

}
