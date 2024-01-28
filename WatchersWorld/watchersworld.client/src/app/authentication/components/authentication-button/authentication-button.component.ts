import { Component, EventEmitter, Input, Output } from '@angular/core';

@Component({
  selector: 'authentication-button',
  templateUrl: './authentication-button.component.html',
  styleUrl: './authentication-button.component.css'
})
export class AuthenticationButtonComponent {
  @Input() buttonText: string = "";
  @Input() buttonType: string = "";
  @Input() icon: string = "";
  @Output() buttonClick = new EventEmitter<void>();

  constructor() { }

  onClick(): void {
    this.buttonClick.emit();
  }
}
