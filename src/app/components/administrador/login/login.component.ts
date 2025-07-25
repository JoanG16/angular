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
   * Ahora se suscribe al Observable del servicio.
   */
  onLoginSubmit(): void { // Ya no es 'async'
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

    console.log('Intentando iniciar sesión con:', this.username);

    this.authService.login(this.username, this.password).subscribe({
      next: (response) => {
        console.log('Inicio de sesión exitoso:', response);
        // Redirigir al panel de administración o a una página de inicio segura
        this.router.navigate(['/inicio']);
        console.log('Intentando navegar a /inicio');
      },
      error: (error) => {
        console.error('Error durante el inicio de sesión (Observable):', error);
        // El handleError del servicio ya lanza un error, aquí lo capturamos
        let displayMessage = 'Ocurrió un error inesperado. Por favor, inténtalo de nuevo.';
        if (error instanceof Error) { // Si el error es el que lanzamos desde handleError
          displayMessage = error.message;
        } else if (error instanceof HttpErrorResponse) {
          // Fallback si por alguna razón handleError no lo transformó
          if (error.status === 401) {
            displayMessage = 'Nombre de usuario o contraseña incorrectos.';
          } else {
            displayMessage = `Error en el servidor: ${error.status} - ${error.statusText || 'Error desconocido'}`;
          }
        }

        this.dialog.open(ConfirmDialogComponent, {
          data: {
            title: 'Error de Inicio de Sesión',
            message: displayMessage,
            confirmButtonText: 'Aceptar',
            hideCancelButton: true
          }
        });
      },
      complete: () => {
        console.log('Proceso de inicio de sesión completado.');
      }
    });
  }
}
