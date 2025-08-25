
// src/auth.service.ts
import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable, BehaviorSubject } from 'rxjs';
import { tap } from 'rxjs/operators';
import { environment } from '../../../environments/environment';

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

  login(username: string, password: string): Observable<LoginResponse> {
    const credentials = { username, password };
    return this.http.post<LoginResponse>(`${this.apiUrl}/auth/login`, credentials).pipe(
      tap(response => {
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

  logout(): void {
    localStorage.removeItem('auth_token');
    localStorage.removeItem('user_role');
    localStorage.removeItem('user_name');
    localStorage.removeItem('local_id');
    this.isAuthenticatedSubject.next(false);
  }

  getToken(): string | null {
    return localStorage.getItem('auth_token');
  }

  getUserRole(): string | null {
    return localStorage.getItem('user_role');
  }

  getUsername(): string | null {
    return localStorage.getItem('user_name');
  }

  getUserLocalId(): string | null {
    return localStorage.getItem('local_id');
  }

  private checkToken(): boolean {
    return !!this.getToken();
  }

  requestPasswordReset(email: string): Observable<PasswordResetRequestResponse> {
    return this.http.post<PasswordResetRequestResponse>(`${this.apiUrl}/auth/forgot-password`, { email });
  }

  resetPassword(token: string, newPassword: string): Observable<PasswordResetResponse> {


    // CORRECCIÓN: Usar 'newPassword' como clave para que coincida con el backend

    return this.http.post<PasswordResetResponse>(`${this.apiUrl}/auth/reset-password/${token}`, { newPassword: newPassword });
  }
}
