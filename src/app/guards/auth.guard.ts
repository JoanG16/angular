// src/app/guards/auth.guard.ts

import { inject } from '@angular/core';
import { CanActivateFn, Router } from '@angular/router';
import { AuthService } from '../services/administrador/auth.service';
import { map, take } from 'rxjs/operators';
import { Observable } from 'rxjs';

// Función CanActivate para usar con provideRouter
export const authGuardFn: CanActivateFn = (route, state) => {
  const authService = inject(AuthService);
  const router = inject(Router);

  // Observa el estado de autenticación.
  // take(1) asegura que solo se tome el primer valor emitido y luego se complete el observable.
  // Esto es importante para que el guardia no se quede suscrito indefinidamente.
  return authService.isAuthenticated$.pipe(
    take(1),
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
