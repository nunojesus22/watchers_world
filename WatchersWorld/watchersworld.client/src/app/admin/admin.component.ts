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
  banTemp() {
    // Your implementation here
  }

  banPerm() {
    // Your implementation here
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

  showBanPopup() {
    this.isBanPopupVisible = true;
  }

  hideBanPopup() {
    this.isBanPopupVisible = false;
  }
}
