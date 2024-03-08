import { Component, ElementRef, HostListener } from '@angular/core';
import { AuthenticationService } from '../authentication/services/authentication.service';
import { MovieApiServiceComponent } from '../movie-api-service/movie-api-service.component';
import { Router } from '@angular/router';
import { SearchServiceComponent } from '../search-service/search-service.component';

@Component({
  selector: 'app-nav-menu',
  templateUrl: './nav-menu.component.html',
  styleUrl: './nav-menu.component.css'
})
export class NavMenuComponent {
  isActive: boolean = false;
  searchQuery: any;
  userRole: string | undefined;


  constructor(private service: MovieApiServiceComponent, public authService: AuthenticationService, private _eref: ElementRef, private router: Router, private searchService: SearchServiceComponent) {
    const username = this.authService.getLoggedInUserName();
    if (username) {
      this.authService.getUserRole(username).subscribe(role => {
        this.userRole = role[0]; // assuming a user can only have one role
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
      this.searchService.changeSearchQuery(this.searchQuery);
      this.router.navigate(['/search']);
    }
  }

  onKeyup() {
    console.log('one key up',this.searchQuery);
  }
}


