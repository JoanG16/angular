// src/app/services/locales.service.ts

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

  getAllLocales(): Observable<Local[]> {
    return this.http.get<LocalResponse>(`${this.apiUrl}/get-all`).pipe(
      map(response => response.data)
    );
  }

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

  deleteLocal(id: number): Observable<void> {
    return this.http.delete<void>(`${this.apiUrl}/delete/${id}`);
  }

  // --- NUEVO MÉTODO: Actualizar el estado de 'activo' ---
  updateLocalStatus(id: number, activo: boolean): Observable<Local> {
    const payload = { activo };
    return this.http.patch<Local>(`${this.apiUrl}/update-status/${id}`, payload);
  }
}
