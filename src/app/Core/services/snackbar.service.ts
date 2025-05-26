import { inject, Injectable } from '@angular/core';
import { MatSnackBar, MatSnackBarConfig } from '@angular/material/snack-bar';

@Injectable({
  providedIn: 'root'
})
export class SnackbarService {
  private snackbar = inject(MatSnackBar);
  private defaultConfig: MatSnackBarConfig = {
    duration: 5000,
    verticalPosition: 'top',
    horizontalPosition: 'right'
  };

  success(message: string) {
    this.snackbar.open(`✅ ${message}`, 'Close', {
      ...this.defaultConfig,
      panelClass: ['custom-snackbar', 'success-snackbar']
    });
  }

  error(message: string) {
    this.snackbar.open(`❌ ${message}`, 'Close', {
      ...this.defaultConfig,
      panelClass: ['custom-snackbar', 'error-snackbar']
    });
  }
}
