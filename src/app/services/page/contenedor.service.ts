// src/app/services/contenedor.service.ts (o el nombre de tu archivo)

import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { map } from 'rxjs/operators';
import { Contenedor, ContenedorResponse, SingleContenedorResponse } from '../../interfaces/contenedor.interface';
import { environment } from '../../../environments/environment'; // <-- ¡AÑADE ESTA LÍNEA!
                                                            // Asegúrate de que la ruta sea correcta para tu proyecto.

interface ContenedorPayload {
  numero_contenedor: string;
  bloque: string;
  geom: number[][];
  socioId?: number;
}

@Injectable({ providedIn: 'root' })
export class ContenedorService {
  // MODIFICADO: Ahora la URL base se construye usando environment.apiUrl
  // Asumiendo que environment.apiUrl ya incluye 'http://localhost:3000/v1/api' (o la URL de ngrok)
  // y solo necesitamos añadir '/contenedores' para este servicio.
  private baseUrl = `${environment.apiUrl}/contenedores`;

  constructor(private http: HttpClient) { }

  getContenedores(): Observable<Contenedor[]> {
    return this.http.get<ContenedorResponse>(`${this.baseUrl}/get-all`).pipe(
      map((response: ContenedorResponse) => response.data)
    );
  }

  createContenedor(data: ContenedorPayload): Observable<any> {
    return this.http.post(`${this.baseUrl}/create`, data);
  }

  updateContenedor(id: number, data: ContenedorPayload): Observable<any> {
    return this.http.put(`${this.baseUrl}/update/${id}`, data);
  }

  deleteContenedor(id: number): Observable<any> {
    return this.http.delete(`${this.baseUrl}/delete/${id}`);
  }

  getOneContenedor(id: number): Observable<Contenedor> {
    return this.http.get<SingleContenedorResponse>(`${this.baseUrl}/get-one/${id}`).pipe(
      map(response => response.data)
    );
  }
}