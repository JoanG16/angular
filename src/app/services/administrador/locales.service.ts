import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { Local, LocalResponse, SingleLocalResponse } from '../../interfaces/locales.interface'; // Asegúrate de que la ruta sea correcta
import { map } from 'rxjs/operators';

@Injectable({
  providedIn: 'root'
})
export class LocalesService {
  private apiUrl = 'http://localhost:3000/v1/api/locales'; // Asume que tu backend corre en el puerto 3000

  constructor(private http: HttpClient) { }

  getAllLocales(): Observable<Local[]> {
    return this.http.get<LocalResponse>(`${this.apiUrl}/get-all`).pipe(
      map(response => response.data)
    );
  }

  getLocales(): Observable<Local[]> {
    // Esto asume que el backend envía { data: Local[], message: "...", status: "...", statusCode: ... }
    // y solo nos interesa el array 'data'.
    return this.http.get<{ data: Local[], message: string, status: string, statusCode: number }>(this.apiUrl).pipe(
      map(response => response.data)
    );
  }

  // NUEVO MÉTODO: Para obtener un solo local por su ID
  getOneLocal(id: number): Observable<Local> {
    // Se asume que el backend para un solo local responde con { data: Local }
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


  deleteLocal(id: number): Observable<void> { // Devuelve 'void' si el backend no retorna contenido en una eliminación exitosa (código 204)
    return this.http.delete<void>(`${this.apiUrl}/delete/${id}`); // Ajusta la ruta si tu endpoint es diferente
  }
}