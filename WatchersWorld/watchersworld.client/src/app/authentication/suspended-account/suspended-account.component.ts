import { Component } from '@angular/core';
import { Router, NavigationStart } from '@angular/router';

@Component({
  selector: 'app-suspended-account',
  templateUrl: './suspended-account.component.html',
  styleUrls: ['./suspended-account.component.css']
})
export class SuspendedAccountComponent {
  banDurationMessage: string = '';

  constructor(private router: Router) {
    const currentNavigation = this.router.getCurrentNavigation();
    if (currentNavigation?.extras?.state) {
      this.banDurationMessage = currentNavigation.extras.state['banDurationMessage'];
    }
  }


  redirectToLogin() {
    this.router.navigateByUrl('/account/login');
  }
}
