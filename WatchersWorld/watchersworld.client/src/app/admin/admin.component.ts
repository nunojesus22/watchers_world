import { ChangeDetectorRef, Component, OnDestroy } from '@angular/core';
import { Subject, forkJoin, of } from 'rxjs';
import { catchError, map, mergeMap, takeUntil } from 'rxjs/operators';
import { Profile } from '../profile/models/profile';
import { ProfileService } from '../profile/services/profile.service';
import { AuthenticationService } from '../authentication/services/authentication.service';
import { AdminService } from '../admin/service/admin.service'
import { Router } from '@angular/router';


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
  isModerator?: boolean;


  constructor(private cdRef: ChangeDetectorRef,private profileService: ProfileService, private authService: AuthenticationService, private adminService: AdminService, private router: Router) { }


  ngOnInit(): void {
    this.loggedUserName = this.authService.getLoggedInUserName();
    if (this.loggedUserName) {
      // Obtem as roles do usuário atual
      this.authService.getUserRole(this.loggedUserName).subscribe({
        next: (roles) => {
          // Verifica se o usuário tem a role de admin
          if (!roles.includes('Admin')) {
            this.router.navigate(['/']); // Redireciona para a página inicial se não for admin
            return;
          }
          // Se for admin, executa as funções de busca
          this.getUserProfiles();

        },
        error: (error) => console.error("Error fetching user roles:", error)
      });
    } else {
      // Se não estiver logado ou se o nome do usuário não estiver disponível, redireciona
      this.router.navigate(['/']);
    }
  }

  ngOnDestroy() {
    this.unsubscribed$.next();
    this.unsubscribed$.complete();

  }

  getUserProfiles() {
    this.profileService.getUserProfiles().pipe(
      takeUntil(this.unsubscribed$),
      mergeMap(profiles => {
        const profilesWithRoles$ = profiles.map(profile => {
          if (!profile.userName) {
            // Handle the case where userName is undefined
            // Perhaps log a warning or handle however you see fit
            console.warn(`Profile with undefined userName encountered: `, profile);
            return of({ ...profile, isModerator: false });
          }
          // Now it's safe to call getUserRole because we've ensured userName is defined
          return this.adminService.getUserRole(profile.userName).pipe(
            map(roles => ({
              ...profile,
              isBanned: this.checkIfUserIsBanned(profile),
              isModerator: roles.includes('Moderator'),
            })),
            catchError(error => {
              console.error('Error fetching roles:', profile.userName, error);
              return of({ ...profile, isModerator: false }); // default to false on error
            })
          );
        });
        return forkJoin(profilesWithRoles$);
      })
    ).subscribe(
      (profiles: Profile[]) => {
        this.usersProfiles = profiles;


        this.cdRef.detectChanges();
      },
      (error) => {
        console.error("Error while fetching users' profiles:", error);
      }
    );
  }



  checkIfUserIsBanned(profile: Profile): boolean {
    try {
      if (!profile.startBanDate || !profile.endBanDate) {
        return false;
      }

      const now = new Date();
      const startBan = new Date(profile.startBanDate);
      const endBan = new Date(profile.endBanDate);
      const isBanned = startBan <= now && now <= endBan;

      return isBanned;
    } catch (error) {
      console.error('Error in checkIfUserIsBanned:', error);
      return false;
    }
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
        this.hideBanPopup();
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
        this.hideBanPopup();
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

  demoteToUser(userName: string): void {
    if (!userName) {
      console.error('Username is undefined, cannot change role.');
      return;
    }
    console.log(`Changing role of user: ${userName} to User`);
    this.adminService.changeRoleToUser(userName).subscribe({
      next: response => {
        console.log('Moderator role updated to User successfully:', response);
        // Verify the role change
        this.verifyUserRole(userName);
      },
      error: error => {
        console.error("Error changing user role:", error);
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
