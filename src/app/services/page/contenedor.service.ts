import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { map } from 'rxjs/operators';
import { Contenedor, ContenedorResponse, SingleContenedorResponse } from '../../interfaces/contenedor.interface';

interface ContenedorPayload {
  numero_contenedor: string;
  bloque: string;
  geom: number[][];
  socioId?: number;
}

@Injectable({ providedIn: 'root' })
export class ContenedorService {
  private baseUrl = 'http://localhost:3000/v1/api/contenedores';

  constructor(private http: HttpClient) { }

  getContenedores(): Observable<Contenedor[]> {
    return this.http.get<ContenedorResponse>(`${this.baseUrl}/get-all`).pipe(
      map((response: ContenedorResponse) => response.data)
    );
  }

  createContenedor(data: ContenedorPayload): Observable<any> {
    return this.http.post(`${this.baseUrl}/create`, data);
  }

  updateContenedor(id: number, data: ContenedorPayload): Observable<any> {
    return this.http.put(`${this.baseUrl}/update/${id}`, data);
  }

  deleteContenedor(id: number): Observable<any> {
    return this.http.delete(`${this.baseUrl}/delete/${id}`);
  }

  getOneContenedor(id: number): Observable<Contenedor> {
    return this.http.get<SingleContenedorResponse>(`${this.baseUrl}/get-one/${id}`).pipe(
      map(response => response.data)
    );
  }
}
