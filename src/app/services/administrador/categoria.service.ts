// src/app/services/categoria.service.ts (o el nombre de tu archivo)

import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { map } from 'rxjs/operators'; // Asegúrate de importar 'map'
import { Categoria, CategoriaResponse } from '../../interfaces/categoria.interface'; // Asegúrate de que la ruta sea correcta
import { environment } from '../../../environments/environment'; // <-- ¡AÑADE ESTA LÍNEA!
                                                            // Asegúrate de que la ruta sea correcta para tu proyecto.

@Injectable({
  providedIn: 'root'
})
export class CategoriaService {
  // MODIFICADO: Ahora la URL base se construye usando environment.apiUrl
  // Asumiendo que environment.apiUrl ya incluye 'http://localhost:3000/v1/api' (o la URL de ngrok)
  // y solo necesitamos añadir '/categorias' para este servicio.
  private baseUrl = `${environment.apiUrl}/categorias`; // Asegúrate de que esta URL base sea correcta

  constructor(private http: HttpClient) { }

  getAllCategorias(): Observable<Categoria[]> {
    return this.http.get<CategoriaResponse>(`${this.baseUrl}/get-all`).pipe(
      map(response => response.data)
    );
  }

  getOneCategoria(id: number): Observable<Categoria> {
    return this.http.get<any>(`${this.baseUrl}/get-one/${id}`).pipe(
      map(response => response.data)
    );
  }

  createCategoria(categoria: Partial<Categoria>): Observable<any> {
    return this.http.post(`${this.baseUrl}/create`, categoria);
  }

  updateCategoria(id: number, categoria: Partial<Categoria>): Observable<any> {
    return this.http.put(`${this.baseUrl}/update/${id}`, categoria);
  }

  deleteCategoria(id: number): Observable<any> {
    return this.http.delete(`${this.baseUrl}/delete/${id}`);
  }
}