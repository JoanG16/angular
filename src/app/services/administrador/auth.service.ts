// src/app/services/administrador/auth.service.ts
import { Injectable } from '@angular/core';
import { HttpClient, HttpErrorResponse } from '@angular/common/http';
import { Observable, throwError, BehaviorSubject, of } from 'rxjs';
import { catchError, tap, map } from 'rxjs/operators'; // Añadir 'map' si no está

import { Router } from '@angular/router';
import { environment } from '../../../environments/environment';

// Interfaz para la respuesta de login del backend
interface LoginResponse {
  statusCode: number;
  status: string;
  message: string;
  data: {
    token: string;
    user: {
      id_user: number;
      username: string;
      role: string;
    };
  };
}

@Injectable({
  providedIn: 'root'
})
export class AuthService {
  public apiUrl = `${environment.apiUrl}/auth`; // Usar apiUrl directamente para el endpoint auth
  private tokenKey = 'jwt_token';
  private userRoleKey = 'user_role';
  private usernameKey = 'username';

  // BehaviorSubject para el estado de autenticación
  // Se inicializa con el estado actual del token en localStorage
  private _isAuthenticated = new BehaviorSubject<boolean>(this.checkAuthenticationStatus());
  isAuthenticated$ = this._isAuthenticated.asObservable();

  // BehaviorSubject para el rol del usuario
  private _userRole = new BehaviorSubject<string | null>(localStorage.getItem(this.userRoleKey));
  userRole$ = this._userRole.asObservable();

  // BehaviorSubject para el nombre de usuario
  private _username = new BehaviorSubject<string | null>(localStorage.getItem(this.usernameKey));
  username$ = this._username.asObservable();

  constructor(
    private http: HttpClient,
    private router: Router
  ) { }

  /**
   * Verifica si hay un token válido en localStorage.
   * Puedes añadir aquí lógica para verificar la validez del JWT (ej. expiración)
   * si quieres que el estado inicial sea más preciso.
   */
  private checkAuthenticationStatus(): boolean {
    const token = localStorage.getItem(this.tokenKey);
    // Para una verificación más robusta, podrías decodificar el token y verificar su expiración aquí
    // if (token) {
    //   try {
    //     const decoded = jwt_decode(token); // Necesitarías una librería como jwt-decode
    //     return decoded.exp * 1000 > Date.now();
    //   } catch (e) {
    //     return false; // Token inválido
    //   }
    // }
    return !!token; // Por ahora, solo verifica si existe el token
  }

  /**
   * Intenta iniciar sesión con las credenciales proporcionadas.
   * Ahora devuelve un Observable<LoginResponse> para ser más idiomático con Angular.
   */
  login(username: string, password: string): Observable<LoginResponse> {
    const credentials = { username, password };
    return this.http.post<LoginResponse>(`${this.apiUrl}/login`, credentials)
      .pipe(
        tap(response => {
          if (response.data && response.data.token) {
            localStorage.setItem(this.tokenKey, response.data.token);
            localStorage.setItem(this.userRoleKey, response.data.user.role);
            localStorage.setItem(this.usernameKey, response.data.user.username);
            // Actualizar los BehaviorSubjects DESPUÉS de guardar en localStorage
            this._isAuthenticated.next(true);
            this._userRole.next(response.data.user.role);
            this._username.next(response.data.user.username);
            console.log('Login exitoso. Token y datos guardados.');
          }
        }),
        catchError(this.handleError)
      );
  }

  /**
   * Cierra la sesión del usuario.
   */
  logout(): void {
    localStorage.removeItem(this.tokenKey);
    localStorage.removeItem(this.userRoleKey);
    localStorage.removeItem(this.usernameKey);
    // Actualizar los BehaviorSubjects a null/false DESPUÉS de limpiar localStorage
    this._isAuthenticated.next(false);
    this._userRole.next(null);
    this._username.next(null);
    this.router.navigate(['/login']);
  }

  /**
   * Obtiene el token JWT del localStorage.
   * @returns El token JWT o null si no existe.
   */
  getToken(): string | null {
    return localStorage.getItem(this.tokenKey);
  }

  /**
   * Obtiene el rol del usuario del localStorage.
   * @returns El rol del usuario o null si no existe.
   */
  getUserRole(): string | null {
    return localStorage.getItem(this.userRoleKey);
  }

  /**
   * Obtiene el nombre de usuario del localStorage.
   * @returns El nombre de usuario o null si no existe.
   */
  getUsername(): string | null {
    return localStorage.getItem(this.usernameKey);
  }

  /**
   * Manejador de errores para las peticiones HTTP.
   */
  private handleError(error: HttpErrorResponse): Observable<never> {
    let errorMessage = 'Un error desconocido ocurrió.';
    if (error.error instanceof ErrorEvent) {
      errorMessage = `Error: ${error.error.message}`;
    } else {
      if (error.status === 401) {
        errorMessage = 'Credenciales inválidas o token expirado. Por favor, inicie sesión de nuevo.';
      } else if (error.error && error.error.message) {
        errorMessage = error.error.message;
      } else {
        errorMessage = `Código de error: ${error.status}, mensaje: ${error.message}`;
      }
    }
    console.error('AuthService error:', errorMessage);
    // Es importante lanzar un nuevo error para que el suscriptor del componente pueda manejarlo
    return throwError(() => new Error(errorMessage));
  }
}
