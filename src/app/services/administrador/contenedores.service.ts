// src/app/services/contenedores.service.ts (o el nombre de tu archivo)

import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { environment } from '../../../environments/environment'; // <-- ¡AÑADE ESTA LÍNEA!
//          
import { Contenedor, ContenedorResponse, SingleContenedorResponse } from '../../interfaces/contenedor.interface';
// No necesitas 'map' si devuelves la respuesta completa
// import { map } from 'rxjs/operators';                                         // Asegúrate de que la ruta sea correcta para tu proyecto.
import { LocalResponse } from '../../interfaces/locales.interface';
@Injectable({
  providedIn: 'root'
})
export class ContenedoresService {
  // MODIFICADO: Ahora la URL base se construye usando environment.apiUrl
  // Asumiendo que environment.apiUrl ya incluye 'http://localhost:3000/v1/api' (o la URL de ngrok)
  // y solo necesitamos añadir '/contenedores' para este servicio.
  private apiUrl = `${environment.apiUrl}/contenedores`;

  constructor(private http: HttpClient) { }

  getAllContenedores(): Observable<ContenedorResponse> {
    return this.http.get<ContenedorResponse>(`${this.apiUrl}/get-all`);
  }

  // Si tienes otros métodos que devuelven un solo contenedor, asegúrate de que también sean correctos
  getOneContenedor(id: number): Observable<SingleContenedorResponse> {
    return this.http.get<SingleContenedorResponse>(`${this.apiUrl}/get-one/${id}`);
  }
}