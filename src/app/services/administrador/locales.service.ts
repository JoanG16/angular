// src/app/services/locales.service.ts (o el nombre de tu archivo)

import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { Local, LocalResponse, SingleLocalResponse } from '../../interfaces/locales.interface'; // Asegúrate de que la ruta sea correcta
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
  private apiUrl = `${environment.apiUrl}/locales`; // Asume que tu backend corre en el puerto 3000

  constructor(private http: HttpClient) { }

  getAllLocales(): Observable<Local[]> {
    return this.http.get<LocalResponse>(`${this.apiUrl}/get-all`).pipe(
      map(response => response.data)
    );
  }

  // Este método 'getLocales()' parece ser redundante con 'getAllLocales()',ac
  // ya que ambos llaman a la misma URL base sin un sub-path específico.
  // Si tienen propósitos diferentes, asegúrate de que la URL sea distinta.
  // Si no, considera eliminar uno.
 getLocales(): Observable<LocalResponse> {
    return this.http.get<LocalResponse>(`${this.apiUrl}/get-all`);
  }

  getOneLocal(id: number): Observable<Local> {
    return this.http.get<SingleLocalResponse>(`${this.apiUrl}/get-one/${id}`).pipe(
      map(response => response.data)
    );
  }

  createLocal(local: Local): Observable<Local> {
    return this.http.post<Local>(`${this.apiUrl}/create`, local);
  }

  updateLocal(id: number, local: Local): Observable<Local> {
    return this.http.put<Local>(`${this.apiUrl}/update/${id}`, local);
  }

  deleteLocal(id: number): Observable<void> {
    return this.http.delete<void>(`${this.apiUrl}/delete/${id}`);
  }
}