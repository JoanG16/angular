// src/app/services/socios.service.ts (o el nombre de tu archivo)

import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { map } from 'rxjs/operators'; // Importa el operador map
import { Socio } from '../../interfaces/socio.interface'; // Asegúrate de la ruta
import { environment } from '../../../environments/environment'; // <-- ¡AÑADE ESTA LÍNEA!
                                                            // Asegúrate de que la ruta sea correcta para tu proyecto.

@Injectable({
  providedIn: 'root'
})
export class SociosService {
  // MODIFICADO: Ahora la URL base se construye usando environment.apiUrl
  // Asumiendo que environment.apiUrl ya incluye 'http://localhost:3000/v1/api' (o la URL de ngrok)
  // y solo necesitamos añadir '/socios' para este servicio.
  private apiUrl = `${environment.apiUrl}/socios`;

  constructor(private http: HttpClient) { }

  getAllSocios(): Observable<Socio[]> {
    return this.http.get<{ data: Socio[] }>(`${this.apiUrl}/get-all`).pipe(
      map(response => response.data)
    );
  }

  getOneSocio(id: number): Observable<Socio> {
    // Si este endpoint también devuelve { data: Socio }, necesitarías un map aquí también
    // Asumiendo que getOneSocio devuelve directamente el objeto Socio sin 'data'
    return this.http.get<Socio>(`${this.apiUrl}/get-one/${id}`);
  }

  createSocio(socio: Partial<Socio>): Observable<Socio> {
    return this.http.post<Socio>(`${this.apiUrl}/create`, socio);
  }

  updateSocio(id: number, socio: Partial<Socio>): Observable<Socio> {
    return this.http.put<Socio>(`${this.apiUrl}/update/${id}`, socio);
  }

  deleteSocio(id: number): Observable<void> {
    return this.http.delete<void>(`${this.apiUrl}/delete/${id}`);
  }
}