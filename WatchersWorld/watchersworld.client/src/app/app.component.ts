import { HttpClient } from '@angular/common/http';
import { Component, HostListener, OnInit } from '@angular/core';
import { AuthenticationService } from './authentication/services/authentication.service';

@Component({
  selector: 'app-root',
  templateUrl: './app.component.html',
  styleUrl: './app.component.css'
})
export class AppComponent implements OnInit {

  constructor(private http: HttpClient, private authService: AuthenticationService) {


  }

  ngOnInit() {
    this.refreshUser();
  }

  private refreshUser() {
    const jwt = this.authService.getJWT();
    if (jwt) {
      this.authService.refreshUser(jwt).subscribe({
        next: _ => { },
        error: _ => {
          this.authService.logout();
        }
      });
    } else {
      this.authService.refreshUser(null).subscribe();
    }
  }

}
