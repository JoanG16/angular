import { Component, Inject } from '@angular/core';
import { MAT_DIALOG_DATA, MatDialogRef, MatDialogModule } from '@angular/material/dialog';
import { MatButtonModule } from '@angular/material/button';
import { CommonModule } from '@angular/common'; // <-- ¡Añadido!

@Component({
  selector: 'app-confirm-dialog',
  standalone: true,
  imports: [
    MatDialogModule,
    MatButtonModule,
    CommonModule // <-- ¡Añadido a los imports!
  ],
  templateUrl: './confirm-dialog.component.html',
  styleUrl: './confirm-dialog.component.css'
})
export class ConfirmDialogComponent {
  constructor(
    public dialogRef: MatDialogRef<ConfirmDialogComponent>,
    @Inject(MAT_DIALOG_DATA) public data: {
      title: string;
      message: string;
      confirmButtonText: string;
      cancelButtonText?: string;
      hideCancelButton?: boolean;
      isDanger?: boolean;
    }
  ) { }

  onConfirmClick(): void {
    this.dialogRef.close(true);
  }

  onCancelClick(): void {
    this.dialogRef.close(false);
  }
}