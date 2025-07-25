// src/app/app.config.ts

import { ApplicationConfig, inject } from '@angular/core';
import { provideRouter } from '@angular/router';
import { routes } from './app.routes';
import { provideHttpClient, withInterceptors } from '@angular/common/http';
import { AuthService } from './services/administrador/auth.service';
import { environment } from '../environments/environment';

// Importar todos los servicios que necesitan ser provistos
import { ContenedoresService } from './services/administrador/contenedores.service';
import { LocalesService } from './services/administrador/locales.service';
import { CategoriaService } from './services/administrador/categoria.service';
import { ProductoService } from './services/administrador/producto.service';
import { SociosService } from './services/administrador/socios.service';
import { OfertaService } from './services/administrador/ofertas.service';

// ¡IMPORTA ESTO PARA HABILITAR LAS ANIMACIONES!
import { provideAnimationsAsync } from '@angular/platform-browser/animations/async';

// Importar el nuevo interceptor
import { AuthInterceptor } from './interceptors/auth.interceptor';
import { HTTP_INTERCEPTORS } from '@angular/common/http';

// CAMBIO CLAVE: Importar authGuardFn en lugar de AuthGuard
// Ya no necesitas importar AuthGuard como una clase, solo la función si la usas directamente
// import { AuthGuard } from './guards/auth.guard'; // ELIMINAR O COMENTAR ESTO
// La función authGuardFn se inyecta directamente en las rutas, no necesita ser provista aquí
// si solo la usas como CanActivateFn.

export const appConfig: ApplicationConfig = {
  providers: [
    provideRouter(routes),
    provideHttpClient(
      withInterceptors([
        (request, next) => {
          const authService = inject(AuthService);
          const authToken = authService.getToken();

          const loginUrl = `${environment.apiUrl}/auth/login`;
          const registerUrl = `${environment.apiUrl}/auth/register`;

          if (authToken && request.url !== loginUrl && request.url !== registerUrl) {
            request = request.clone({
              setHeaders: {
                Authorization: `Bearer ${authToken}`
              }
            });
          }
          return next(request);
        }
      ])
    ),
    // Proveer todos los servicios necesarios
    AuthService,
    // CAMBIO CLAVE: Eliminar AuthGuard de los providers, ya no es una clase provista
    // AuthGuard, // ELIMINAR O COMENTAR ESTA LÍNEA
    ContenedoresService,
    LocalesService,
    CategoriaService,
    ProductoService,
    SociosService,
    OfertaService,
    provideAnimationsAsync(),
    {
      provide: HTTP_INTERCEPTORS,
      useClass: AuthInterceptor,
      multi: true
    }
  ]
};
