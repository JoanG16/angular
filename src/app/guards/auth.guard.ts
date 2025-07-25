// src/app/guards/auth.guard.ts

import { inject } from '@angular/core';
import { CanActivateFn, Router } from '@angular/router';
import { AuthService } from '../services/administrador/auth.service';
import { map, first } from 'rxjs/operators'; // CAMBIO: Usar 'first' en lugar de 'take'
import { Observable } from 'rxjs';

export const authGuardFn: CanActivateFn = (route, state) => {
  const authService = inject(AuthService);
  const router = inject(Router);

  return authService.isAuthenticated$.pipe(
    first(), // CAMBIO CLAVE: Usa first() para tomar el primer valor y completar
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
