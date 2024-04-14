import { Component, Output, Input, EventEmitter } from '@angular/core';
import {
  ConfirmBoxInitializer,
  DialogLayoutDisplay,
  DisappearanceAnimation,
  AppearanceAnimation
} from '@costlydeveloper/ngx-awesome-popup';

/**
 * Componente de diálogo de confirmação.
 * Este componente é utilizado para mostrar uma caixa de diálogo de confirmação ao utilizador,
 * permitindo a ele confirmar ou cancelar uma ação.
 */
@Component({
  selector: 'app-confirm-dialog',
  templateUrl: './confirm-dialog.component.html',
  styleUrl: './confirm-dialog.component.css'
})
export class ConfirmDialogComponent {
  /** Título do botão, padrão é "Confirmar". */
  @Input() titleButton: string = "Confirmar";
  /** Classe CSS adicional para estilização do componente. */
  @Input() classCss?: string;
  /** Título do popup de confirmação, padrão é "Confirmação". */
  @Input() titlePopup: string = 'Confirmação';
  /** Mensagem no popup de confirmação, padrão é "Têm a certeza que pretende executar esta ação?". */
  @Input() messagePopup: string = 'Têm a certeza que pretende executar esta ação?';
  /** Texto do botão de confirmação, padrão é "Confirmar". */
  @Input() confirmationTextButton: string = 'Confirmar';
  /** Texto do botão de cancelar, padrão é "Cancelar". */
  @Input() cancelTextButton: string = 'Cancelar';

  /** Evento emitido quando a ação é confirmada. */
  @Output() confirmAction = new EventEmitter<any>();

  constructor() { }

  /**
   * Método chamado ao confirmar a ação no diálogo.
   * Inicializa uma nova caixa de confirmação e configura suas propriedades e animações.
   * Ao confirmar, emite o evento `confirmAction`.
   */
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
