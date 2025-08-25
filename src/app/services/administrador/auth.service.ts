import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable, BehaviorSubject } from 'rxjs';
import { tap } from 'rxjs/operators';
import { environment } from '../../../environments/environment';

// Interfaz corregida para que coincida con la respuesta real del backend.
interface UserData {
  id_user: number;
  username: string;
  role: string;
  id_local?: number | null;
}

interface LoginResponse {
  data: {
    token: string;
    user: UserData;
  };
}

// Interfaces para los nuevos endpoints
interface PasswordResetRequestResponse {
  statusCode: number;
  status: string;
  message: string;
}

interface PasswordResetResponse {
  statusCode: number;
  status: string;
  message: string;
}

@Injectable({
  providedIn: 'root'
})
export class AuthService {
  private apiUrl = environment.apiUrl;
  private isAuthenticatedSubject = new BehaviorSubject<boolean>(this.checkToken());

  public isAuthenticated$ = this.isAuthenticatedSubject.asObservable();

  constructor(private http: HttpClient) { }

  /**
   * Intenta iniciar sesión y guarda los datos de autenticación en localStorage.
   */
  login(username: string, password: string): Observable<LoginResponse> {
    const credentials = { username, password };
    return this.http.post<LoginResponse>(`${this.apiUrl}/auth/login`, credentials).pipe(
      tap(response => {
        // Almacena la información del usuario en el localStorage.
        localStorage.setItem('auth_token', response.data.token);
        localStorage.setItem('user_role', response.data.user.role);
        localStorage.setItem('user_name', response.data.user.username);

        if (response.data.user.id_local) {
          localStorage.setItem('local_id', response.data.user.id_local.toString());
        } else {
          localStorage.removeItem('local_id');
        }

        this.isAuthenticatedSubject.next(true);
      })
    );
  }

  /**
   * Cierra la sesión y elimina los datos de autenticación.
   */
  logout(): void {
    localStorage.removeItem('auth_token');
    localStorage.removeItem('user_role');
    localStorage.removeItem('user_name');
    localStorage.removeItem('local_id');
    this.isAuthenticatedSubject.next(false);
  }

  /**
   * Recupera el token del localStorage.
   */
  getToken(): string | null {
    return localStorage.getItem('auth_token');
  }

  /**
   * Recupera el rol del usuario del localStorage.
   */
  getUserRole(): string | null {
    return localStorage.getItem('user_role');
  }

  /**
   * RECUPERA EL NOMBRE DE USUARIO DEL LOCALSTORAGE.
   */
  getUsername(): string | null {
    return localStorage.getItem('user_name');
  }

  /**
   * Recupera el ID del local del localStorage.
   */
  getUserLocalId(): string | null {
    return localStorage.getItem('local_id');
  }

  /**
   * Comprueba la existencia del token para verificar la autenticación.
   */
  private checkToken(): boolean {
    return !!this.getToken();
  }

  /**
   * Envía una solicitud de recuperación de contraseña al backend.
   * @param email El correo electrónico del usuario.
   */
  requestPasswordReset(email: string): Observable<PasswordResetRequestResponse> {
    return this.http.post<PasswordResetRequestResponse>(`${this.apiUrl}/auth/forgot-password`, { email });
  }

  /**
   * Envía el token y la nueva contraseña para restablecerla.
   * @param token El token de recuperación.
   * @param newPassword La nueva contraseña.
   */
  resetPassword(token: string, newPassword: string): Observable<PasswordResetResponse> {
    // CORRECCIÓN: Usar 'newPassword' como clave para que coincida con el backend
    return this.http.post<PasswordResetResponse>(`${this.apiUrl}/auth/reset-password/${token}`, { newPassword: newPassword });
  }
}
