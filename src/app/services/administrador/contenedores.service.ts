// src/app/services/contenedores.service.ts (o el nombre de tu archivo)

import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { Contenedor } from '../../interfaces/contenedor.interface';
import { environment } from '../../../environments/environment'; // <-- ¡AÑADE ESTA LÍNEA!
                                                            // Asegúrate de que la ruta sea correcta para tu proyecto.

@Injectable({
  providedIn: 'root'
})
export class ContenedoresService {
  // MODIFICADO: Ahora la URL base se construye usando environment.apiUrl
  // Asumiendo que environment.apiUrl ya incluye 'http://localhost:3000/v1/api' (o la URL de ngrok)
  // y solo necesitamos añadir '/contenedores' para este servicio.
  private apiUrl = `${environment.apiUrl}/contenedores`;

  constructor(private http: HttpClient) { }

  getAllContenedores(): Observable<{ data: Contenedor[] }> {
    return this.http.get<any>(`${this.apiUrl}/get-all`);
  }
}