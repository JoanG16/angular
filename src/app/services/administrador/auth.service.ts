import { Injectable } from '@angular/core';
import { HttpClient, HttpErrorResponse } from '@angular/common/http';
import { Observable, throwError, BehaviorSubject } from 'rxjs';
import { catchError, map, tap } from 'rxjs/operators';
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
  private baseUrl = `${environment.apiUrl}/auth`; // Endpoint de autenticación en tu backend
  private tokenKey = 'jwt_token'; // Clave para almacenar el token en localStorage
  private userRoleKey = 'user_role'; // Clave para almacenar el rol del usuario
  private usernameKey = 'username'; // Clave para almacenar el nombre de usuario

  // BehaviorSubject para el estado de autenticación (observable)
  // Emite true si el usuario está logueado, false si no
  private _isAuthenticated = new BehaviorSubject<boolean>(this.hasToken());
  isAuthenticated$ = this._isAuthenticated.asObservable(); // Observable público

  // BehaviorSubject para el rol del usuario (observable)
  private _userRole = new BehaviorSubject<string | null>(localStorage.getItem(this.userRoleKey));
  userRole$ = this._userRole.asObservable(); // Observable público

  // BehaviorSubject para el nombre de usuario (observable)
  private _username = new BehaviorSubject<string | null>(localStorage.getItem(this.usernameKey));
  username$ = this._username.asObservable(); // Observable público

  constructor(
    private http: HttpClient,
    private router: Router
  ) { }

  /**
   * Verifica si hay un token en localStorage para determinar el estado inicial de autenticación.
   */
  private hasToken(): boolean {
    return !!localStorage.getItem(this.tokenKey);
  }

  /**
   * Intenta iniciar sesión con las credenciales proporcionadas.
   * @returns Una promesa que resuelve a true si el login fue exitoso, o false si falló.
   */
  login(username: string, password: string): Promise<boolean> {
    return new Promise((resolve, reject) => {
      this.http.post<LoginResponse>(`${this.baseUrl}/login`, { username, password })
        .pipe(
          tap(response => {
            // Almacenar el token y el rol en localStorage
            localStorage.setItem(this.tokenKey, response.data.token);
            localStorage.setItem(this.userRoleKey, response.data.user.role);
            localStorage.setItem(this.usernameKey, response.data.user.username);
            // Actualizar el estado de autenticación y rol
            this._isAuthenticated.next(true);
            this._userRole.next(response.data.user.role);
            this._username.next(response.data.user.username); // Actualizar el nombre de usuario
            console.log('Login exitoso. Token guardado:', response.data.token);
          }),
          catchError(this.handleError) // Manejo de errores centralizado
        )
        .subscribe({
          next: () => resolve(true),
          error: (err) => reject(err) // Rechazar la promesa con el error
        });
    });
  }

  /**
   * Cierra la sesión del usuario.
   */
  logout(): void {
    // Eliminar el token y el rol de localStorage
    localStorage.removeItem(this.tokenKey);
    localStorage.removeItem(this.userRoleKey);
    localStorage.removeItem(this.usernameKey);
    // Actualizar el estado de autenticación y rol
    this._isAuthenticated.next(false);
    this._userRole.next(null);
    this._username.next(null); // Limpiar el nombre de usuario
    // Redirigir a la página de login o al inicio
    this.router.navigate(['/login']); // Ajusta esta ruta si tu página de login es diferente
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
      // Error del lado del cliente
      errorMessage = `Error: ${error.error.message}`;
    } else {
      // Error del lado del servidor
      if (error.status === 401) {
        errorMessage = 'Credenciales inválidas.';
      } else if (error.error && error.error.message) {
        errorMessage = error.error.message;
      } else {
        errorMessage = `Código de error: ${error.status}, mensaje: ${error.message}`;
      }
    }
    console.error('AuthService error:', errorMessage);
    return throwError(() => new Error(errorMessage));
  }
}
