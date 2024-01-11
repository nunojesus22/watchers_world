import { Component, Input } from '@angular/core';

@Component({
  selector: 'authentication-button',
  templateUrl: './authentication-button.component.html',
  styleUrl: './authentication-button.component.css'
})
export class AuthenticationButtonComponent {
  @Input() buttonText: string = "";
  @Input() buttonType: string = "";
  @Input() icon: string = "";

  constructor(){ }
}
