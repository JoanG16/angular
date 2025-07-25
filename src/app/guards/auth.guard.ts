import { Injectable, inject } from '@angular/core';
import { CanActivateFn, Router, ActivatedRouteSnapshot, RouterStateSnapshot } from '@angular/router';
import { AuthService } from '../services/administrador/auth.service'; // Asegúrate de que la ruta sea correcta
import { map, take } from 'rxjs/operators';
import { Observable } from 'rxjs';

@Injectable({
  providedIn: 'root'
})
export class AuthGuard {
  constructor(private authService: AuthService, private router: Router) {}

  canActivate(
    route: ActivatedRouteSnapshot,
    state: RouterStateSnapshot
  ): Observable<boolean> {
    return this.authService.isAuthenticated$.pipe(
      take(1), // Toma el primer valor y luego completa
      map(isAuthenticated => {
        if (isAuthenticated) {
          // Si está autenticado, permite el acceso
          return true;
        } else {
          // Si no está autenticado, redirige a la página de login
          this.router.navigate(['/login']);
          return false;
        }
      })
    );
  }
}

// Función CanActivate para usar con provideRouter
export const authGuardFn: CanActivateFn = (route, state) => {
  const authService = inject(AuthService);
  const router = inject(Router);

  return authService.isAuthenticated$.pipe(
    take(1),
    map(isAuthenticated => {
      if (isAuthenticated) {
        return true;
      } else {
        router.navigate(['/login']);
        return false;
      }
    })
  );
};
