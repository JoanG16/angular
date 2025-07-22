// src/app/services/locales.service.ts (o el nombre de tu archivo)

import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { Local, LocalResponse } from '../../interfaces/locales.interface'; // Mantener la ruta que ya tienes
import { map } from 'rxjs/operators';
import { environment } from '../../../environments/environment'; // <-- ¡AÑADE ESTA LÍNEA!
                                                            // Asegúrate de que la ruta sea correcta para tu proyecto.

@Injectable({
  providedIn: 'root'
})
export class LocalesService {
  // MODIFICADO: Ahora la URL base se construye usando environment.apiUrl
  // Asumiendo que environment.apiUrl ya incluye 'http://localhost:3000/v1/api' (o la URL de ngrok)
  // y solo necesitamos añadir '/locales' para este servicio.
  private baseUrl = `${environment.apiUrl}/locales`;

  constructor(private http: HttpClient) { }

  getAllLocales(): Observable<Local[]> {
    return this.http.get<LocalResponse>(`${this.baseUrl}/get-all`).pipe(
      map(response => response.data)
    );
  }

  createLocal(local: Local): Observable<Local> {
    return this.http.post<Local>(`${this.baseUrl}/create`, local);
  }

  updateLocal(id: number, local: Local): Observable<Local> {
    return this.http.put<Local>(`${this.baseUrl}/update/${id}`, local);
  }

  deleteLocal(id: number): Observable<void> {
    return this.http.delete<void>(`${this.baseUrl}/delete/${id}`);
  }
}