import { Component, ElementRef, HostListener } from '@angular/core';
import { AuthenticationService } from '../authentication/services/authentication.service';

@Component({
  selector: 'app-nav-menu',
  templateUrl: './nav-menu.component.html',
  styleUrl: './nav-menu.component.css'
})
export class NavMenuComponent {

  constructor(public authService: AuthenticationService, private _eref: ElementRef) {}
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

}


