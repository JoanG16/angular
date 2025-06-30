import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { map } from 'rxjs/operators';
import { Contenedor, ContenedorResponse } from '../../interfaces/contenedor.interface';

@Injectable({
  providedIn: 'root'
})
export class MapaContenedoresService {
  private apiUrl = 'http://localhost:3000/v1/api/contenedores/create';
  private baseUrl = 'http://localhost:3000/v1/api/contenedores/get-all';

  constructor(private http: HttpClient) { }

  getContenedores(): Observable<Contenedor[]> {
    return this.http.get<ContenedorResponse>('http://localhost:3000/v1/api/contenedores/get-all').pipe(
      map((response: ContenedorResponse) => response.data)
    );
  }


  createContenedor(data: {
    numero_contenedor: string;
    bloque: string;
    geom: number[][];
  }): Observable<any> {
    return this.http.post(this.apiUrl, data);
  }
}
