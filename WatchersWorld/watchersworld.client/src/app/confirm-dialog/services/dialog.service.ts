import { Injectable } from '@angular/core';
import { ConfirmDialogComponent } from '../confirm-dialog.component';
import { MatDialog } from '@angular/material/dialog';

@Injectable({
  providedIn: 'root'
})
export class DialogService {

  constructor(private dialog: MatDialog) { }

  openConfirmDialog() {
    this.dialog.open(ConfirmDialogComponent, {
      width: '250px',
      disableClose: true
    })
  }
}
