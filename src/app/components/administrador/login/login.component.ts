// src/app/components/administrador/login/login.component.ts
import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { Router, RouterLink } from '@angular/router';
import { AuthService } from '../../../services/administrador/auth.service';
import { MatDialog, MatDialogModule } from '@angular/material/dialog';
import { ConfirmDialogComponent } from '../../confirm-dialog/confirm-dialog.component';
import { HttpErrorResponse } from '@angular/common/http';

@Component({
  selector: 'app-login',
  standalone: true,
  imports: [
    CommonModule,
    FormsModule,
    MatDialogModule,
    RouterLink
  ],
  templateUrl: './login.component.html',
  styleUrls: ['./login.component.css']
})
export class LoginComponent {
  username = '';
  password = '';
  errorMessage: string | null = null;

  constructor(
    private authService: AuthService,
    private router: Router,
    private dialog: MatDialog
  ) { }

  /**
   * Maneja el envío del formulario de inicio de sesión.
   */
  onLoginSubmit(): void { // Cambiado a void porque ya no es async/await directo
    this.errorMessage = null;

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

    console.log('Intentando iniciar sesión con:', this.username); // LOG DE DEPURACIÓN

    // Suscribirse al Observable devuelto por authService.login
    this.authService.login(this.username, this.password).subscribe({
      next: (response) => {
        console.log('Inicio de sesión exitoso:', response); // LOG DE DEPURACIÓN
        // Redirigir al panel de administración o a una página de inicio segura
        this.router.navigate(['/inicio']);
      },
      error: (error) => {
        console.error('Error durante el inicio de sesión (Observable):', error); // LOG DE DEPURACIÓN
        if (error instanceof HttpErrorResponse) {
          if (error.status === 401) {
            this.errorMessage = 'Nombre de usuario o contraseña incorrectos.';
          } else if (error.error && error.error.message) {
            // Si el backend envía un mensaje de error específico
            this.errorMessage = error.error.message;
          }
          else {
            this.errorMessage = `Error en el servidor: ${error.status} - ${error.statusText || 'Error desconocido'}`;
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
      },
      complete: () => {
        console.log('Proceso de inicio de sesión completado.'); // LOG DE DEPURACIÓN
      }
    });
  }
}
