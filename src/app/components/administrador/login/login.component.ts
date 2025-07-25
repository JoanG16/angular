import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms'; // Importar FormsModule para ngModel
import { Router, RouterLink } from '@angular/router'; // Importar RouterLink aquí
import { AuthService } from '../../../services/administrador/auth.service'; // Ruta a tu nuevo servicio de autenticación
import { MatDialog, MatDialogModule } from '@angular/material/dialog';
import { ConfirmDialogComponent } from '../../confirm-dialog/confirm-dialog.component';
import { HttpErrorResponse } from '@angular/common/http';

@Component({
  selector: 'app-login',
  standalone: true,
  imports: [
    CommonModule,
    FormsModule, // Necesario para el two-way data binding con ngModel
    MatDialogModule, // Para usar MatDialog
    RouterLink // ¡Añadir RouterLink aquí!
  ],
  templateUrl: './login.component.html',
  styleUrls: ['./login.component.css']
})
export class LoginComponent {
  username = '';
  password = '';
  errorMessage: string | null = null; // Para mostrar mensajes de error al usuario

  constructor(
    private authService: AuthService,
    private router: Router,
    private dialog: MatDialog // Inyectar MatDialog
  ) { }

  /**
   * Maneja el envío del formulario de inicio de sesión.
   */
  async onLoginSubmit(): Promise<void> {
    this.errorMessage = null; // Limpiar cualquier mensaje de error anterior

    if (!this.username || !this.password) {
      this.dialog.open(ConfirmDialogComponent, {
        data: {
          title: 'Campos Requeridos',
          message: 'Por favor, ingresa tu nombre de usuario y contraseña.',
          confirmButtonText: 'Aceptar',
          hideCancelButton: true
        }
      });
      return;
    }

    try {
      // Llamar al servicio de autenticación para intentar iniciar sesión
      const success = await this.authService.login(this.username, this.password);

      if (success) {
        // Redirigir al panel de administración o a una página de inicio segura
        this.router.navigate(['/inicio']); // Ajusta esta ruta a tu panel de administración
      } else {
        // Esto no debería ejecutarse si el servicio lanza un error para credenciales inválidas
        // Pero es un fallback
        this.errorMessage = 'Credenciales inválidas. Inténtalo de nuevo.';
        this.dialog.open(ConfirmDialogComponent, {
          data: {
            title: 'Error de Inicio de Sesión',
            message: this.errorMessage,
            confirmButtonText: 'Aceptar',
            hideCancelButton: true
          }
        });
      }
    } catch (error) {
      console.error('Error durante el inicio de sesión:', error);
      if (error instanceof HttpErrorResponse) {
        if (error.status === 401) {
          this.errorMessage = 'Nombre de usuario o contraseña incorrectos.';
        } else {
          this.errorMessage = `Error en el servidor: ${error.message}`;
        }
      } else {
        this.errorMessage = 'Ocurrió un error inesperado. Por favor, inténtalo de nuevo.';
      }

      this.dialog.open(ConfirmDialogComponent, {
        data: {
          title: 'Error de Inicio de Sesión',
          message: this.errorMessage,
          confirmButtonText: 'Aceptar',
          hideCancelButton: true
        }
      });
    }
  }
}
