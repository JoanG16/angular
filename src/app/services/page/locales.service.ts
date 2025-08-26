// src/app/services/administrador/locales.service.ts

import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { environment } from '../../../environments/environment';
import { Local } from '../../interfaces/locales.interface';

@Injectable({
  providedIn: 'root'
})
export class LocalesService {
  // CORRECCIÓN: La URL base ahora solo tiene '/locales' porque
  // environment.apiUrl ya contiene '/v1/api'
  private apiUrl = environment.apiUrl + '/locales';

  constructor(private http: HttpClient) { }

  // Obtiene todos los locales
  getAllLocales(): Observable<Local[]> {
    return this.http.get<Local[]>(this.apiUrl);
  }

  // Obtiene un solo local por ID
  getOneLocal(id: number): Observable<Local> {
    return this.http.get<Local>(`${this.apiUrl}/${id}`);
  }

  // Crea un nuevo local
  createLocal(local: Local): Observable<Local> {
    return this.http.post<Local>(this.apiUrl, local);
  }

  // Actualiza un local existente
  updateLocal(id: number, local: Partial<Local>): Observable<Local> {
    return this.http.put<Local>(`${this.apiUrl}/${id}`, local);
  }

  // Desactiva un local (usa la ruta deleteLocal del backend)
  deleteLocal(id: number): Observable<any> {
    return this.http.delete<any>(`${this.apiUrl}/${id}`);
  }

  // Activa un local (usa la nueva ruta activateLocal del backend)
  activateLocal(id: number): Observable<any> {
    // La URL de tu backend es /locales/activate/:id
    return this.http.put<any>(`${this.apiUrl}/activate/${id}`, {});
  }

  // Descarga el reporte de Excel
  downloadLocalesExcel(): Observable<Blob> {
    // Asegúrate de que la URL coincida con la ruta de tu controlador en el backend
    return this.http.get(`${this.apiUrl}/reporte-excel`, {
      responseType: 'blob'
    });
  }
}