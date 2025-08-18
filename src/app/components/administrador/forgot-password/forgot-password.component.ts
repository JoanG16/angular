import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { MatDialog, MatDialogModule } from '@angular/material/dialog';
import { ConfirmDialogComponent } from '../../confirm-dialog/confirm-dialog.component';
import { Router } from '@angular/router';
import { AuthService } from '../../../services/administrador/auth.service';

@Component({
  selector: 'app-forgot-password',
  standalone: true,
  imports: [
    CommonModule,
    FormsModule,
    MatDialogModule
  ],
  templateUrl: './forgot-password.component.html',
  styleUrls: ['./forgot-password.component.css']
})
export class ForgotPasswordComponent {
  // El modelo para el formulario
  email: string = '';
  isLoading: boolean = false;

  constructor(
    private dialog: MatDialog,
    private router: Router,
    private authService: AuthService
  ) { }

  /**
   * Maneja el envío del formulario de recuperación de contraseña.
   */
  onSubmit(): void {
    if (!this.email) {
      this.showDialog('Error', 'Por favor, ingresa tu correo electrónico.', true);
      return;
    }

    this.isLoading = true;

    // Llamada real al servicio para solicitar la recuperación
    this.authService.requestPasswordReset(this.email).subscribe({
      next: () => {
        this.isLoading = false;
        // Mensaje genérico de éxito por razones de seguridad.
        const successMessage = 'Si tu correo electrónico existe, recibirás un enlace de recuperación. Por favor, revisa tu bandeja de entrada.';
        this.showDialog('Éxito', successMessage, true).afterClosed().subscribe(() => {
          this.router.navigate(['/login']);
        });
      },
      error: (err) => {
        this.isLoading = false;
        // El mensaje de error también debe ser genérico por seguridad.
        const errorMessage = 'Si tu correo electrónico existe, recibirás un enlace de recuperación. Por favor, revisa tu bandeja de entrada.';
        this.showDialog('Éxito', errorMessage, true);
      }
    });
  }

  /**
   * Muestra un diálogo de confirmación.
   * @param title Título del diálogo.
   * @param message Mensaje principal.
   * @param hideCancelButton Si es true, oculta el botón de cancelar.
   * @returns La referencia del diálogo.
   */
  private showDialog(title: string, message: string, hideCancelButton: boolean = false) {
    return this.dialog.open(ConfirmDialogComponent, {
      data: {
        title: title,
        message: message,
        confirmButtonText: 'Aceptar',
        hideCancelButton: hideCancelButton
      }
    });
  }

  irAPagina(titulo: string): void {
    this.router.navigate([titulo])
  }
}
