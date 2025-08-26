// src/app/services/administrador/locales.service.ts
import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { Local, LocalResponse, SingleLocalResponse } from '../../interfaces/locales.interface';
import { map } from 'rxjs/operators'; // Necesario si usas map
import { environment } from '../../../environments/environment'; // Asegúrate de que la ruta sea correcta

@Injectable({
  providedIn: 'root'
})
export class LocalesService {
  private apiUrl = `${environment.apiUrl}/locales`;

  constructor(private http: HttpClient) { }

  /**
   * Obtiene todos los locales del backend.
   * Devuelve la respuesta completa de la API (LocalResponse).
   */
  getLocales(): Observable<LocalResponse> {
    return this.http.get<LocalResponse>(`${this.apiUrl}/get-all`);
  }

  /**
   * Obtiene un solo local por su ID.
   * Devuelve solo el objeto Local del campo 'data'.
   */
  getOneLocal(id: number): Observable<Local> {
    return this.http.get<SingleLocalResponse>(`${this.apiUrl}/get-one/${id}`).pipe(
      map(response => response.data)
    );
  }

  /**
   * Crea un nuevo local.
   * Devuelve solo el objeto Local del campo 'data' de la respuesta.
   */
  createLocal(local: Local): Observable<Local> {
    return this.http.post<SingleLocalResponse>(`${this.apiUrl}/create`, local).pipe(
      map(response => response.data)
    );
  }

  /**
   * Actualiza un local existente.
   * Devuelve solo el objeto Local del campo 'data' de la respuesta.
   */
  updateLocal(id: number, local: Local): Observable<Local> {
    return this.http.put<SingleLocalResponse>(`${this.apiUrl}/update/${id}`, local).pipe(
      map(response => response.data)
    );
  }

  /**
   * Elimina un local.
   * Devuelve void (sin contenido).
   */
  deleteLocal(id: number): Observable<void> {
    return this.http.delete<void>(`${this.apiUrl}/delete/${id}`);
  }
}
