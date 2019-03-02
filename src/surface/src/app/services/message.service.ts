import { Injectable } from '@angular/core';
import { MatSnackBar, MatSnackBarConfig } from '@angular/material';

@Injectable({
  providedIn: 'root'
})
export class MessageService {

  constructor(private snackBar: MatSnackBar) { }
    openSnackbar(message) {
      const config = new MatSnackBarConfig();
      config.verticalPosition = 'top';
      config.horizontalPosition = 'center';
      config.duration = 3000;
      config.panelClass = ['snackbar'];
      this.snackBar.open(message, undefined, config);
    }
}
