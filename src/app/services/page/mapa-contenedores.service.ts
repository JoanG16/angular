// src/app/services/mapa-contenedores.service.ts (o el nombre de tu archivo)

import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { map } from 'rxjs/operators';
import { Contenedor, ContenedorResponse } from '../../interfaces/contenedor.interface';
import { environment } from '../../../environments/environment'; // Asegúrate de que esta ruta sea correcta

@Injectable({
  providedIn: 'root'
})
export class MapaContenedoresService {
  // MODIFICADO: Ahora la URL base se construye usando environment.apiUrl
  // Asumiendo que environment.apiUrl ya incluye 'http://localhost:3000/v1/api' (o la URL de ngrok)
  // y solo necesitamos añadir '/contenedores' para este servicio.
  private baseUrl = `${environment.apiUrl}/contenedores`;

  constructor(private http: HttpClient) { }

  getContenedores(): Observable<Contenedor[]> {
    // MODIFICADO: Usa this.baseUrl para construir la URL
    return this.http.get<ContenedorResponse>(`${this.baseUrl}/get-all`).pipe(
      map((response: ContenedorResponse) => response.data)
    );
  }

  createContenedor(data: {
    numero_contenedor: string;
    bloque: string;
    geom: number[][];
  }): Observable<any> {
    // MODIFICADO: Usa this.baseUrl para construir la URL
    // Si 'create' es un endpoint directo de '/contenedores', entonces es correcto.
    // Si 'create' es un sub-path de 'contenedores/create', entonces sería `${this.baseUrl}/create`.
    // Basado en tu código original, parece que 'create' es un sub-path de 'contenedores'.
    return this.http.post(`${this.baseUrl}/create`, data);
  }
}