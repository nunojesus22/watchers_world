import { Injectable } from '@angular/core';
import { ConfirmDialogComponent } from '../confirm-dialog.component';
import { MatDialog } from '@angular/material/dialog';

/**
 * Serviço para gerenciar diálogos de confirmação.
 * Este serviço é responsável por abrir diálogos de confirmação através do MatDialog.
 */
@Injectable({
  providedIn: 'root'
})
export class DialogService {
  /**
   * Construtor que injeta o serviço MatDialog.
   * @param dialog Serviço MatDialog utilizado para abrir diálogos.
   */
  constructor(private dialog: MatDialog) { }

  /**
   * Abre um diálogo de confirmação usando o componente ConfirmDialogComponent.
   * Este diálogo é configurado para não ser fechado ao clicar fora dele.
   */
  openConfirmDialog() {
    this.dialog.open(ConfirmDialogComponent, {
      width: '250px',
      disableClose: true
    })
  }
}
