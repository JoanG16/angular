// src/app/services/administrador/oferta.service.ts

import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { map } from 'rxjs/operators';
import { Oferta, OfertaResponse, SingleOfertaResponse } from '../../interfaces/oferta.interface';

// Interfaz para el payload que se envía al backend (sin id_oferta)
interface OfertaPayload {
    tipo_contenido: 'promocion' | 'tiktok' | 'youtube';
    valor_contenido: string;
    orden?: number | null;
    activo: boolean;
}

@Injectable({
  providedIn: 'root'
})
export class OfertaService {
  private baseUrl = 'http://localhost:3000/v1/api/ofertas'; // Asegúrate de que esta URL coincida con tu backend

  constructor(private http: HttpClient) { }

  // Obtener todas las ofertas
  getAllOfertas(): Observable<Oferta[]> {
    return this.http.get<OfertaResponse>(`${this.baseUrl}/get-all`).pipe(
      map(response => response.data) // Extraer el array de datos
    );
  }

  // Obtener una oferta por ID
  getOneOferta(id: number): Observable<Oferta> {
    return this.http.get<SingleOfertaResponse>(`${this.baseUrl}/get-one/${id}`).pipe(
      map(response => response.data) // Extraer el objeto de datos
    );
  }

  // Crear una nueva oferta
  createOferta(data: OfertaPayload): Observable<Oferta> {
    return this.http.post<SingleOfertaResponse>(`${this.baseUrl}/create`, data).pipe(
      map(response => response.data) // El backend debería devolver la oferta creada
    );
  }

  // Actualizar una oferta existente
  updateOferta(id: number, data: Partial<OfertaPayload>): Observable<Oferta> {
    return this.http.put<SingleOfertaResponse>(`${this.baseUrl}/update/${id}`, data).pipe(
      map(response => response.data) // El backend debería devolver la oferta actualizada
    );
  }

  // Eliminar una oferta
  deleteOferta(id: number): Observable<any> { // Puede ser 'void' si el backend no devuelve contenido
    return this.http.delete(`${this.baseUrl}/delete/${id}`);
  }
}
