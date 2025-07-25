// src/app/guards/auth.guard.ts (Solo si la Opción 1 no funciona)

import { inject } from '@angular/core';
import { CanActivateFn, Router } from '@angular/router';
import { AuthService } from '../services/administrador/auth.service';
import { map, delay } from 'rxjs/operators'; // CAMBIO: Usar 'delay'
import { Observable } from 'rxjs';

export const authGuardFn: CanActivateFn = (route, state) => {
  const authService = inject(AuthService);
  const router = inject(Router);

  return authService.isAuthenticated$.pipe(
    delay(0), // CAMBIO CLAVE: Introduce un micro-retraso
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