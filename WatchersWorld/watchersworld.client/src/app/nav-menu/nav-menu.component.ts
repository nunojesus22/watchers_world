import { Component, ElementRef, HostListener } from '@angular/core';
import { AuthenticationService } from '../authentication/services/authentication.service';
import { Router } from '@angular/router';
import { SearchServiceComponent } from '../media/search-service/search-service.component';
import { MovieApiServiceComponent } from '../media/api/movie-api-service/movie-api-service.component';
import { ProfileService } from '../profile/services/profile.service';
import { Subject, takeUntil } from 'rxjs';
import { FollowerProfile } from '../profile/models/follower-profile';
import { NotificationService } from '../notifications/services/notification.service';

@Component({
  selector: 'app-nav-menu',
  templateUrl: './nav-menu.component.html',
  styleUrl: './nav-menu.component.css'
})
export class NavMenuComponent {
  loggedUserName: string | null = null;
  isActive: boolean = false;
  searchQuery: any;
  unsubscribed$: Subject<void> = new Subject<void>();
  pendingFollowRequests: FollowerProfile[] = [];
  hasUnreadNotifications: boolean = false;


  constructor(private service: MovieApiServiceComponent, private profileService: ProfileService, private notificationService: NotificationService, public authService: AuthenticationService, private _eref: ElementRef, private router: Router, private searchService: SearchServiceComponent) {}

  ngOnInit(): void {
    this.loggedUserName = this.authService.getLoggedInUserName();
    this.getPendingFollowRequests();
    this.checkForUnreadNotifications();
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

  checkForUnreadNotifications(): void {
    if (this.loggedUserName) {
      this.notificationService.hasUnreadNotifications(this.loggedUserName)
        .subscribe({
          next: (response) => {
            console.log(response);
           this.hasUnreadNotifications = response.hasUnread;
          },
          error: (err) => {
          }
        });
    }
  }

  showMenu = false;
  @HostListener('document:click', ['$event'])
  clickout(event: MouseEvent) {
    if (!this._eref.nativeElement.contains(event.target)) {
      this.showMenu = false;
      let sidebar = document.getElementById("sidebar");
      if (sidebar) {
        sidebar.style.width = "0";
      }
    }
  }
  toggleMenu(event: MouseEvent) {
    event.stopPropagation();
    this.showMenu = !this.showMenu;
    let sidebar = document.getElementById("sidebar");
    if (sidebar) {
      if (this.showMenu) {
        sidebar.style.width = "250px";
      } else {
        sidebar.style.width = "0";
      }
    }
  }

  closeNav() {
    this.showMenu = false;
    let sidebar = document.getElementById("sidebar");
    if (sidebar) {
      sidebar.style.width = "0";
    }

  }

  onSubmit() {
    if (this.searchQuery) {
      // Isso garante que a pesquisa é comunicada através de parâmetros de consulta
      this.router.navigate(['/search'], { queryParams: { title: this.searchQuery } });
    }
  }

  onKeyup() {
    console.log('one key up',this.searchQuery);
  }

  navigateBasedOnRole(username: string) {
    this.authService.getUserRole(username).subscribe((roles: string[]) => {
      if (roles.includes('Admin')) {
        this.router.navigate(['/admin']);
      } else if (roles.includes('User') || roles.includes('Moderator')) {
        this.router.navigate(['/profile', username]);
      } else {
        // Handle case for users without Admin or User roles or redirect to a default route
        this.router.navigate(['/home']);
      }
    }, error => {
      console.error('Error fetching user role', error);
      this.router.navigate(['/home']); // Fallback in case of an error
    });
  }

  logout() {
    this.authService.logout();
  }


}


