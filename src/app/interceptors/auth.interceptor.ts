import { Injectable } from '@angular/core';
import {
  HttpRequest,
  HttpHandler,
  HttpEvent,
  HttpInterceptor
} from '@angular/common/http';
import { Observable } from 'rxjs';
import { AuthService } from '../services/administrador/auth.service';
import { environment } from '../../environments/environment'; // Importar el archivo de entorno

@Injectable()
export class AuthInterceptor implements HttpInterceptor {

  constructor(private authService: AuthService) {}

  intercept(request: HttpRequest<any>, next: HttpHandler): Observable<HttpEvent<any>> {
    // Obtener el token del servicio de autenticación
    const authToken = this.authService.getToken();

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

    // Pasar la solicitud (modificada o no) al siguiente manejador
    return next.handle(request);
  }
}
