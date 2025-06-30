import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { Local, LocalResponse } from '../../interfaces/locales.interface'; // Mantener la ruta que ya tienes
import { map } from 'rxjs/operators';

@Injectable({
  providedIn: 'root'
})
export class LocalesService {
  private apiUrl = 'http://localhost:3000/v1/api/locales';

  constructor(private http: HttpClient) { }

  // CORRECCIÓN: Este método ahora mapea directamente la respuesta para devolver Local[]
  getAllLocales(): Observable<Local[]> {
    // Asume que el backend envía { data: Local[], message: "...", status: "...", statusCode: ... }
    // y solo nos interesa el array 'data'.
    return this.http.get<LocalResponse>(`${this.apiUrl}/get-all`).pipe(
      map(response => response.data)
    );
  }

  // Eliminado el método 'getLocales()' redundante

  createLocal(local: Local): Observable<Local> {
    return this.http.post<Local>(`${this.apiUrl}/create`, local);
  }

  updateLocal(id: number, local: Local): Observable<Local> {
    return this.http.put<Local>(`${this.apiUrl}/update/${id}`, local);
  }

  deleteLocal(id: number): Observable<void> {
    return this.http.delete<void>(`${this.apiUrl}/delete/${id}`);
  }
}
