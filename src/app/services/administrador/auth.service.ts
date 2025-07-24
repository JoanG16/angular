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
  public apiUrl = environment.apiUrl; // <-- Añade esta propiedad
  private tokenKey = 'authToken';
  private isAuthenticatedSubject = new BehaviorSubject<boolean>(this.hasToken());

  isAuthenticated$ = this.isAuthenticatedSubject.asObservable();

  constructor(private http: HttpClient) { }

  private hasToken(): boolean {
    return !!localStorage.getItem(this.tokenKey);
  }

  login(credentials: any): Observable<any> {
    return this.http.post<any>(`${this.apiUrl}/auth/login`, credentials).pipe(
      tap(response => {
        if (response.token) {
          localStorage.setItem(this.tokenKey, response.token);
          this.isAuthenticatedSubject.next(true);
        }
      })
    );
  }

  register(userData: any): Observable<any> {
    return this.http.post<any>(`${this.apiUrl}/auth/register`, userData);
  }

  getToken(): string | null {
    return localStorage.getItem(this.tokenKey);
  }

  // Método de logout para limpiar el token y redirigir
  logout(): void {
    localStorage.removeItem(this.tokenKey);
    this.isAuthenticatedSubject.next(false);
    // Puedes añadir una redirección aquí si lo deseas, o dejar que el interceptor lo haga
    // this.router.navigate(['/login']); // Si AuthService tiene Router inyectado
  }
}
