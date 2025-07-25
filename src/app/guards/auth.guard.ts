// src/app/guards/auth.guard.ts

import { inject } from '@angular/core';
import { CanActivateFn, Router } from '@angular/router';
import { AuthService } from '../services/administrador/auth.service';
import { map, first } from 'rxjs/operators'; // CAMBIO: Usar 'first'
import { Observable } from 'rxjs';

// Función CanActivate para usar con provideRouter
export const authGuardFn: CanActivateFn = (route, state) => {
  const authService = inject(AuthService);
  const router = inject(Router);

  // Usamos .pipe(first()) para asegurarnos de que el guardia espera la primera emisión
  // del BehaviorSubject, que ya debería estar actualizada después del login.
  return authService.isAuthenticated$.pipe(
    first(), // Toma el primer valor emitido y luego el observable se completa
    map(isAuthenticated => {
      if (isAuthenticated) {
        console.log('AuthGuard: Usuario autenticado. Acceso permitido.');
        return true;
      } else {
        console.warn('AuthGuard: Usuario no autenticado. Redirigiendo a /login.');
        router.navigate(['/login']);
        return false;
      }
    })
  );
};
