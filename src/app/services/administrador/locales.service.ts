// src/app/services/administrador/locales.service.ts

import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { environment } from '../../../environments/environment';
import { Local } from '../../interfaces/locales.interface';

// Definimos la misma interfaz aquí para un mejor tipado en el servicio
interface ApiResponse<T> {
  statusCode: number;
  status: string;
  message: string;
  data: T;
}

@Injectable({
  providedIn: 'root'
})
export class LocalesService {
  private apiUrl = environment.apiUrl + '/locales';

  constructor(private http: HttpClient) { }

  // CORRECCIÓN: Ahora el método retorna el objeto completo de respuesta
  // de la API, no solo el array de datos.
  getAllLocales(): Observable<ApiResponse<Local[]>> {
    return this.http.get<ApiResponse<Local[]>>(this.apiUrl);
  }

  // CORRECCIÓN: Similar al anterior, se ajusta el tipo de retorno.
  getOneLocal(id: number): Observable<ApiResponse<Local>> {
    return this.http.get<ApiResponse<Local>>(`${this.apiUrl}/${id}`);
  }

  // CORRECCIÓN: Similar al anterior, se ajusta el tipo de retorno.
  createLocal(local: Local): Observable<ApiResponse<Local>> {
    return this.http.post<ApiResponse<Local>>(this.apiUrl, local);
  }

  // CORRECCIÓN: Similar al anterior, se ajusta el tipo de retorno.
  updateLocal(id: number, local: Partial<Local>): Observable<ApiResponse<Local>> {
    return this.http.put<ApiResponse<Local>>(`${this.apiUrl}/${id}`, local);
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
