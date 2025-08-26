import { Component, OnInit } from '@angular/core';
import { Router, RouterLink } from '@angular/router';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { AuthService } from '../../../services/administrador/auth.service';
import { catchError } from 'rxjs/operators';
import { throwError } from 'rxjs';
import { HttpErrorResponse } from '@angular/common/http';

@Component({
  selector: 'app-login',
  standalone: true,
  imports: [
    CommonModule,
    FormsModule,
    RouterLink
  ],
  templateUrl: './login.component.html',
  styleUrls: ['./login.component.css']
})
export class LoginComponent implements OnInit {
  credentials = { username: '', password: '' };
  errorMessage: string | null = null;

  constructor(private authService: AuthService, private router: Router) { }

  ngOnInit(): void { }

  /**
   * Maneja el formulario de inicio de sesión.
   * Redirige al usuario según su rol.
   */
  onLoginSubmit() {
    this.authService.login(this.credentials.username, this.credentials.password).pipe(
      catchError((err: HttpErrorResponse) => {
        // Validación para evitar el TypeError:
        // Si err.error existe y es un objeto, intenta acceder a 'message'.
        // Si no, usa un mensaje de error genérico.
        this.errorMessage = err.error?.message || 'Error de autenticación: la respuesta del servidor no tiene el formato esperado.';
        return throwError(() => new Error(this.errorMessage!));
      })
    ).subscribe(response => {
      const userRole = this.authService.getUserRole();
      if (userRole === 'admin') {
        this.router.navigate(['/inicio']);
      } else if (userRole === 'local_owner') {
        const localIdString = this.authService.getUserLocalId();
        if (localIdString) {
          const localId = Number(localIdString);
          this.router.navigate(['/comerciantes/dashboard', localId]);
        } else {
          this.errorMessage = 'Usuario no tiene un local asignado.';
          this.authService.logout();
        }
      } else {
        this.router.navigate(['/login']);
      }
    });
  }

  irAPagina(titulo: string): void {
    this.router.navigate([titulo])
  }
}
