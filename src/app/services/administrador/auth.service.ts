// src/app/services/administrador/auth.service.ts

import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable, BehaviorSubject, of } from 'rxjs'; // Importar 'of'
import { tap, map } from 'rxjs/operators';
import { environment } from '../../../environments/environment';

@Injectable({
  providedIn: 'root'
})
export class AuthService {
  public apiUrl = environment.apiUrl;
  private tokenKey = 'authToken';
  // Inicializar BehaviorSubject con el estado actual del token
  private isAuthenticatedSubject = new BehaviorSubject<boolean>(this.checkAuthenticationStatus());

  isAuthenticated$ = this.isAuthenticatedSubject.asObservable();

  constructor(private http: HttpClient) { }

  // Método para verificar el estado de autenticación basado en el token
  private checkAuthenticationStatus(): boolean {
    const token = localStorage.getItem(this.tokenKey);
    // Aquí podrías añadir lógica para verificar si el token es válido/no expirado
    // Por ahora, solo verificamos su existencia
    return !!token;
  }

  /**
   * Inicia sesión en la aplicación.
   * @param username El nombre de usuario.
   * @param password La contraseña.
   * @returns Un Observable con la respuesta del servidor.
   */
  login(username: string, password: string): Observable<any> {
    const credentials = { username, password };
    return this.http.post<any>(`${this.apiUrl}/auth/login`, credentials).pipe(
      tap(response => {
        if (response.token) {
          localStorage.setItem(this.tokenKey, response.token);
          this.isAuthenticatedSubject.next(true); // Emitir true después de guardar el token
        }
      })
    );
  }

  /**
   * Registra un nuevo usuario.
   * @param userData Los datos del usuario a registrar.
   * @returns Un Observable con la respuesta del servidor.
   */
  register(userData: any): Observable<any> {
    return this.http.post<any>(`${this.apiUrl}/auth/register`, userData);
  }

  /**
   * Obtiene el token de autenticación almacenado.
   * @returns El token de autenticación o null si no existe.
   */
  getToken(): string | null {
    return localStorage.getItem(this.tokenKey);
  }

  /**
   * Obtiene el nombre de usuario decodificando el token JWT.
   * @returns El nombre de usuario o null si no se puede decodificar o no hay token.
   */
  getUsername(): string | null {
    const token = this.getToken();
    if (token) {
      try {
        const payloadBase64 = token.split('.')[1];
        const decodedPayload = JSON.parse(atob(payloadBase64));
        return decodedPayload.username || null;
      } catch (e) {
        console.error('Error al decodificar el token:', e);
        return null;
      }
    }
    return null;
  }

  /**
   * Cierra la sesión del usuario, eliminando el token y actualizando el estado de autenticación.
   */
  logout(): void {
    localStorage.removeItem(this.tokenKey);
    this.isAuthenticatedSubject.next(false); // Emitir false después de eliminar el token
  }
}
