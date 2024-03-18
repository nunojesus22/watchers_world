import { Component, OnDestroy } from '@angular/core';
import { Subject } from 'rxjs';
import { takeUntil } from 'rxjs/operators';
import { Profile } from '../profile/models/profile';
import { ProfileService } from '../profile/services/profile.service';
import { AuthenticationService } from '../authentication/services/authentication.service';
import { AdminService } from '../admin/service/admin.service'


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
  isBanned?: boolean; 


  constructor(private profileService: ProfileService, private authService: AuthenticationService, private adminService: AdminService) { }


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
        // Here you should set the isBanned property based on the data from the server
        this.usersProfiles = profiles.map(profile => {
          return {
            ...profile,
            isBanned: this.checkIfUserIsBanned(profile) // You need to implement this method
          };
        });
      },
      (error) => {
        console.error("Error while fetching users' profiles:", error);
      }
    );
  }

  checkIfUserIsBanned(profile: Profile): boolean {
    // Directly return the isBanned status from the profile
    // If the property could be undefined, provide a default value
    return profile.isBanned ?? false;
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

    this.adminService.BanUserTemporarily(username, this.banDuration).subscribe({
      next: () => {
        console.log(`User banned temporarily for ${this.banDuration} days`);
        const user = this.usersProfiles?.find(u => u.userName === username);
        if (user) {
          user.isBanned = true;
          // This will trigger change detection and update the UI
          this.usersProfiles = [...this.usersProfiles!];
        }
      },
      error: error => {
        console.error("Error banning user temporarily:", error);
      }
    });
  }




  banPerm(username: string | null): void {
    if (!username) {
      console.error('Username is undefined, cannot ban user.');
      return;
    }
    console.log(`Attempting to ban user permanently: ${username}`);
    this.adminService.banUserPermanently(username).subscribe({
      next: () => {
        console.log('User banned permanently');
        const user = this.usersProfiles?.find(u => u.userName === username);
        if (user) {
          user.isBanned = true;
        }
        // This will trigger change detection and update the UI
        this.usersProfiles = [...this.usersProfiles!];
      },
      error: error => {
        console.error("Error banning user:", error);
      }
    });
  }





  deleteAccount(username: string | undefined): void {
    if (!username) {
      console.error('Username is undefined, cannot delete account.');
      return;
    }
    console.log(`Attempting to delete user: ${username}`);
    this.adminService.deleteUserByUsername(username).subscribe({
      next: () => {
        this.usersProfiles = this.usersProfiles?.filter(user => user.userName !== username);
        console.log('User deleted successfully');
      },
      error: error => {
        console.error("Error deleting user:", error);
      }
    });
  }


  makeModerator(userName: string): void {
    if (!userName) {
      console.error('Username is undefined, cannot change role.');
      return;
    }
    console.log(`Changing role of user: ${userName} to Moderator`);
    this.adminService.changeRoleToModerator(userName).subscribe({
      next: response => {
        console.log('User role updated to Moderator successfully:', response);
        // Verify the role change
        this.verifyUserRole(userName);
      },
      error: error => {
        console.error("Error changing user role:", error);
      }
    });
  }

  private verifyUserRole(userName: string): void {
    this.adminService.getUserRole(userName).subscribe({
      next: roles => {
        const isModerator = roles.includes('Moderator');
        console.log(`Is user a moderator: ${isModerator}`);
      },
      error: error => {
        console.error('Error fetching roles:', error);
      }
    });
  }



  unban(username: string | undefined): void {
    if (!username) {
      console.error('Username is undefined, cannot unban user.');
      return;
    }
    this.adminService.unbanUser(username).subscribe({
      next: (response) => {
        console.log(response.message);
        const user = this.usersProfiles?.find(u => u.userName === username);
        if (user) {
          user.isBanned = false;
        }
        // This will trigger change detection and update the UI
        this.usersProfiles = [...this.usersProfiles!];
      },
      error: (error) => {
        console.error("Error unbanning user:", error);
      }
    });
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
