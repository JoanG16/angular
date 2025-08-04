// src/app/services/user.service.ts
import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { UserResponse, SingleUserResponse } from '../../interfaces/user.interface';
import { environment } from '../../../environments/environment';

@Injectable({
  providedIn: 'root'
})
export class UserService {
  private apiUrl = `${environment.apiUrl}/users`; // Ajusta la URL de tu API

  constructor(private http: HttpClient) { }

  /**
   * Obtiene la lista de todos los usuarios.
   */
  getAllUsers(): Observable<UserResponse> {
    return this.http.get<UserResponse>(this.apiUrl);
  }

  /**
   * Crea un nuevo usuario.
   * @param userData Los datos del usuario a crear.
   */
  createUser(userData: any): Observable<SingleUserResponse> {
    // La URL para crear un usuario no necesita un ID
    return this.http.post<SingleUserResponse>(`${this.apiUrl}/`, userData);
  }

  /**
   * Actualiza un usuario existente.
   * @param id El ID del usuario a actualizar.
   * @param userData Los datos actualizados del usuario.
   */
  updateUser(id: number, userData: any): Observable<SingleUserResponse> {
    // CORREGIDO: La URL ahora es `${this.apiUrl}/${id}`
    return this.http.put<SingleUserResponse>(`${this.apiUrl}/${id}`, userData);
  }

  /**
   * Elimina un usuario.
   * @param id El ID del usuario a eliminar.
   */
  deleteUser(id: number): Observable<any> {
    // CORREGIDO: La URL ahora es `${this.apiUrl}/${id}`
    return this.http.delete<any>(`${this.apiUrl}/${id}`);
  }
}
