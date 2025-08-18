import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { ActivatedRoute, Router } from '@angular/router';
import { MatDialog, MatDialogModule } from '@angular/material/dialog';
import { ConfirmDialogComponent } from '../../confirm-dialog/confirm-dialog.component';
import { AuthService } from '../../../services/administrador/auth.service';

@Component({
  selector: 'app-reset-password',
  standalone: true,
  imports: [
    CommonModule,
    FormsModule,
    MatDialogModule
  ],
  templateUrl: './reset-password.component.html',
  styleUrls: ['./reset-password.component.css']
})
export class ResetPasswordComponent implements OnInit {
  token: string | null = null;
  newPassword = '';
  confirmPassword = '';
  errorMessage: string | null = null;
  successMessage: string | null = null;
  isLoading: boolean = false;

  constructor(
    private route: ActivatedRoute,
    private router: Router,
    private dialog: MatDialog,
    private authService: AuthService
  ) { }

  ngOnInit(): void {
    // Captura el token de la URL
    this.route.paramMap.subscribe(params => {
      this.token = params.get('token');
      if (!this.token) {
        this.errorMessage = 'Token de recuperación no válido o faltante.';
      }
    });
  }

  /**
   * Maneja el envío del formulario de nueva contraseña.
   */
  onSubmit(): void {
    this.errorMessage = null; // Limpiar errores anteriores
    this.successMessage = null; // Limpiar mensajes anteriores

    if (!this.token) {
      this.showDialog('Error', 'Token de recuperación no válido o faltante.', true);
      return;
    }

    if (this.newPassword !== this.confirmPassword) {
      this.errorMessage = 'Las contraseñas no coinciden.';
      return;
    }

    if (this.newPassword.length < 6) {
      this.errorMessage = 'La contraseña debe tener al menos 6 caracteres.';
      return;
    }

    this.isLoading = true;

    // Llamada real al servicio para actualizar la contraseña
    this.authService.resetPassword(this.token, this.newPassword).subscribe({
      next: () => {
        this.isLoading = false;
        this.successMessage = 'Contraseña actualizada exitosamente. Ahora puedes iniciar sesión.';
        this.showDialog('Éxito', this.successMessage || '', true).afterClosed().subscribe(() => {
          this.router.navigate(['/login']);
        });
      },
      error: (err) => {
        this.isLoading = false;
        this.errorMessage = err.error?.message || 'Error al actualizar la contraseña. El enlace pudo haber expirado.';
        // CORRECCIÓN: Usamos el operador de fusión nula (??) o el OR lógico (||)
        // para asegurarnos de que el mensaje no sea null.
        this.showDialog('Error', this.errorMessage || 'Error desconocido', true);
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
