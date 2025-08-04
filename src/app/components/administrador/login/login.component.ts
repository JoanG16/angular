import { Component, OnInit } from '@angular/core';
import { Router, RouterLink } from '@angular/router';
import { CommonModule } from '@angular/common'; // Módulo necesario para directivas como *ngIf
import { FormsModule } from '@angular/forms'; // Módulo necesario para [(ngModel)]
import { AuthService } from '../../../services/administrador/auth.service';
import { catchError } from 'rxjs/operators';
import { throwError } from 'rxjs';
import { HttpErrorResponse } from '@angular/common/http';

@Component({
  selector: 'app-login',
  standalone: true, // Indica que este es un componente standalone
  imports: [
    CommonModule, // Agregado para usar *ngIf
    FormsModule, // Agregado para usar [(ngModel)]
    RouterLink // Agregado por si tienes enlaces en tu plantilla
  ],
  templateUrl: './login.component.html',
  styleUrls: ['./login.component.css']
})
export class LoginComponent implements OnInit {
  credentials = { username: '', password: '' };
  errorMessage: string | null = null; // Propiedad que el HTML espera

  constructor(private authService: AuthService, private router: Router) { }

  ngOnInit(): void { }

  /**
   * Maneja el formulario de inicio de sesión.
   * Redirige al usuario según su rol.
   */
  onLoginSubmit() { // Método que el HTML espera
    this.authService.login(this.credentials.username, this.credentials.password).pipe(
      catchError((err: HttpErrorResponse) => {
        this.errorMessage = err.error.message || 'Error de autenticación';
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
}
