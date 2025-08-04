// src/app/app.config.ts

import { ApplicationConfig, inject } from '@angular/core';
import { provideRouter } from '@angular/router';
import { routes } from './app.routes';
import { provideHttpClient, withInterceptors } from '@angular/common/http';
import { AuthService } from './services/administrador/auth.service'; // Asegúrate de que esta importación sea correcta
import { environment } from '../environments/environment';
import { FormsModule } from '@angular/forms'; 
// Importar todos los servicios que necesitan ser provistos (si no tienen providedIn: 'root')
import { ContenedoresService } from './services/administrador/contenedores.service';
import { LocalesService } from './services/administrador/locales.service';
import { CategoriaService } from './services/administrador/categoria.service';
import { ProductoService } from './services/administrador/producto.service';
import { SociosService } from './services/administrador/socios.service';
import { OfertaService } from './services/administrador/ofertas.service';

// ¡IMPORTA ESTO PARA HABILITAR LAS ANIMACIONES!
import { provideAnimationsAsync } from '@angular/platform-browser/animations/async';

// Importar el interceptor
import { HTTP_INTERCEPTORS } from '@angular/common/http';
import { AuthInterceptor } from './interceptors/auth.interceptor'; // Asegúrate de que este interceptor exista

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
    // AuthService ya tiene providedIn: 'root', no es necesario listarlo aquí.
    ContenedoresService,
    LocalesService,
    CategoriaService,
    ProductoService,
    SociosService,
    OfertaService,
    FormsModule,
    provideAnimationsAsync(),
    {
      provide: HTTP_INTERCEPTORS,
      useClass: AuthInterceptor,
      multi: true
    }
  ]
};
