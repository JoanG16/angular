import { ApplicationConfig, inject } from '@angular/core';
import { provideRouter } from '@angular/router';
import { routes } from './app.routes';
import { provideHttpClient, withInterceptors } from '@angular/common/http';
import { AuthService } from './services/administrador/auth.service'; // Asegúrate de que la ruta sea correcta
import { environment } from '../environments/environment'; // Importar el archivo de entorno

// Importar todos los servicios que necesitan ser provistos
import { ContenedoresService } from './services/administrador/contenedores.service';
import { LocalesService } from './services/administrador/locales.service';
import { CategoriaService } from './services/administrador/categoria.service';
import { ProductoService } from './services/administrador/producto.service'; // Asegúrate de la ruta correcta para el servicio de productos públicos
import { SociosService } from './services/administrador/socios.service';
import { OfertaService } from './services/administrador/ofertas.service';
// No es necesario importar AuthGuard aquí si está providedIn: 'root',
// pero se mantiene en los providers para consistencia si se desea.
import { AuthGuard } from './guards/auth.guard';

export const appConfig: ApplicationConfig = {
  providers: [
    provideRouter(routes),
    provideHttpClient(
      withInterceptors([
        (request, next) => {
          const authService = inject(AuthService);
          const authToken = authService.getToken();

          // Definir las URLs de autenticación completas usando environment.apiUrl
          const loginUrl = `${environment.apiUrl}/auth/login`;
          const registerUrl = `${environment.apiUrl}/auth/register`;

          // Clonar la solicitud y añadir el encabezado de autorización si el token existe
          // y si la solicitud NO es para las rutas de login o registro.
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
    // Proveer todos los servicios necesarios para la inyección de dependencias.
    // Aunque algunos puedan tener `providedIn: 'root'`, listarlos aquí puede ayudar
    // a una visión centralizada de las dependencias principales.
    AuthService,
    AuthGuard, // Se provee el AuthGuard para que sus dependencias puedan ser resueltas si se inyecta directamente.
    ContenedoresService,
    LocalesService,
    CategoriaService,
    ProductoService,
    SociosService,
    OfertaService
  ]
};
