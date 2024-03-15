import { HttpClient } from '@angular/common/http';
import { Component, HostListener, OnInit } from '@angular/core';
import { AuthenticationService } from './authentication/services/authentication.service';
import { Title } from '@angular/platform-browser';

@Component({
  selector: 'app-root',
  templateUrl: './app.component.html',
  styleUrl: './app.component.css'
})
export class AppComponent implements OnInit {

  constructor(private http: HttpClient, private authService: AuthenticationService, private title: Title) { }

  ngOnInit() {
    this.refreshUser();
    this.title.setTitle("Watchers World")
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
