import { Component, Output, Input, EventEmitter } from '@angular/core';
import {
  ConfirmBoxInitializer,
  DialogLayoutDisplay,
  DisappearanceAnimation,
  AppearanceAnimation
} from '@costlydeveloper/ngx-awesome-popup';

@Component({
  selector: 'app-confirm-dialog',
  templateUrl: './confirm-dialog.component.html',
  styleUrl: './confirm-dialog.component.css'
})
export class ConfirmDialogComponent {
  @Input() titleButton!: string | "Confirmar";
  @Input() classCss: string | undefined;
  @Input() titlePopup!: string | 'Confirmação'
  @Input() messagePopup!: string | 'Têm a certeza que pretende executar esta ação?';
  @Input() confirmationTextButton!: string | 'Confirmar';
  @Input() cancelTextButton!: string | 'Cancelar';

  @Output() confirmAction = new EventEmitter<any>();

  constructor() { }

  onConfirm(): void {
    const newConfirmBox = new ConfirmBoxInitializer();

    newConfirmBox.setTitle(this.titlePopup);
    newConfirmBox.setMessage(this.messagePopup);

    newConfirmBox.setConfig({
      layoutType: DialogLayoutDisplay.DANGER, 
      animationIn: AppearanceAnimation.NONE, 
      animationOut: DisappearanceAnimation.NONE,
      buttonPosition: 'right', 
    });

    newConfirmBox.setButtonLabels(this.confirmationTextButton, this.cancelTextButton);

    newConfirmBox.openConfirmBox$().subscribe(resp => {
      if (resp.success) {
        this.confirmAction.emit(resp);
      }
    });
  }
}
