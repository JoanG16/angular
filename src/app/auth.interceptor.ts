// src/app/interceptors/auth.interceptor.ts (Crea este nuevo archivo)

import { Injectable, inject } from '@angular/core';
import { HttpInterceptor, HttpRequest, HttpHandler, HttpEvent, HttpErrorResponse } from '@angular/common/http';
import { Observable, throwError } from 'rxjs';
import { catchError } from 'rxjs/operators';
import { Router } from '@angular/router';
import { AuthService } from './services/administrador/auth.service'; // Asegúrate de la ruta correcta

@Injectable()
export class AuthInterceptor implements HttpInterceptor {

  constructor(private router: Router, private authService: AuthService) {}

  intercept(request: HttpRequest<any>, next: HttpHandler): Observable<HttpEvent<any>> {
    const authToken = this.authService.getToken();
    const loginUrl = `${this.authService.apiUrl}/auth/login`; // Asumiendo que AuthService tiene apiUrl
    const registerUrl = `${this.authService.apiUrl}/auth/register`;

    // Añadir el token a la solicitud si existe y no es una solicitud de login/registro
    if (authToken && request.url !== loginUrl && request.url !== registerUrl) {
      request = request.clone({
        setHeaders: {
          Authorization: `Bearer ${authToken}`
        }
      });
    }

    return next.handle(request).pipe(
      catchError((error: HttpErrorResponse) => {
        // Si el error es 401 Unauthorized
        if (error.status === 401) {
          console.warn('401 Unauthorized: Token expirado o inválido. Redirigiendo a login.');
          this.authService.logout(); // Limpiar token y datos de usuario
          this.router.navigate(['/login']); // Redirigir a la página de login
        }
        return throwError(() => error); // Re-lanzar el error para que sea manejado por el componente
      })
    );
  }
}
