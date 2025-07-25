// src/app/services/administrador/auth.service.ts

import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable, BehaviorSubject } from 'rxjs';
import { tap } from 'rxjs/operators';
import { environment } from '../../../environments/environment'; // Asegúrate de la ruta correcta

@Injectable({
  providedIn: 'root'
})
export class AuthService {
  public apiUrl = environment.apiUrl;
  private tokenKey = 'authToken';
  private isAuthenticatedSubject = new BehaviorSubject<boolean>(this.hasToken());

  isAuthenticated$ = this.isAuthenticatedSubject.asObservable();

  constructor(private http: HttpClient) { }

  private hasToken(): boolean {
    return !!localStorage.getItem(this.tokenKey);
  }

  /**
   * Inicia sesión en la aplicación.
   * @param username El nombre de usuario.
   * @param password La contraseña.
   * @returns Un Observable con la respuesta del servidor.
   */
  login(username: string, password: string): Observable<any> {
    // Crear el objeto de credenciales que el backend espera
    const credentials = { username, password };
    return this.http.post<any>(`${this.apiUrl}/auth/login`, credentials).pipe(
      tap(response => {
        if (response.token) {
          localStorage.setItem(this.tokenKey, response.token);
          this.isAuthenticatedSubject.next(true);
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
        // Los JWT tienen 3 partes: header.payload.signature
        // La parte del payload es la segunda (índice 1)
        const payloadBase64 = token.split('.')[1];
        // Decodificar la cadena Base64 a una cadena JSON
        const decodedPayload = JSON.parse(atob(payloadBase64));
        // Asumimos que el payload del token tiene una propiedad 'username'
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
    this.isAuthenticatedSubject.next(false);
  }
}
