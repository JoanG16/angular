import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { Local, LocalResponse, SingleLocalResponse } from '../../interfaces/locales.interface';
import { map } from 'rxjs/operators';
import { environment } from '../../../environments/environment';

@Injectable({
  providedIn: 'root'
})
export class LocalesService {

  private apiUrl = `${environment.apiUrl}/locales`;

  constructor(private http: HttpClient) { }

 
  // Cambiado: Ahora usa la ruta del backend para obtener solo los activos
  getAllLocales(): Observable<Local[]> {
    return this.http.get<LocalResponse>(`${this.apiUrl}/get-all`).pipe(
      map(response => response.data)
    );
  }

  // Se mantiene este método, aunque `getAllLocales` es más descriptivo
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

  // MODIFICADO: Este método ahora llama a la nueva ruta `deactivate`
  deleteLocal(id: number): Observable<void> {
    return this.http.put<void>(`${this.apiUrl}/deactivate/${id}`, {}); // Usamos PUT para la desactivación
  }

  // NUEVO: Método para activar un local
  activateLocal(id: number): Observable<void> {
    return this.http.put<void>(`${this.apiUrl}/activate/${id}`, {});
  }

  // NUEVO: Método para descargar el reporte de Excel
  downloadLocalesExcel(): Observable<Blob> {
    return this.http.get(`${this.apiUrl}/reporte/excel`, { responseType: 'blob' });
  }
}