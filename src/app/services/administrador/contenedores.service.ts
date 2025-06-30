import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { Contenedor } from '../../interfaces/contenedor.interface';

@Injectable({
  providedIn: 'root'
})
export class ContenedoresService {
  private apiUrl = 'http://localhost:3000/v1/api/contenedores';

  constructor(private http: HttpClient) { }

  getAllContenedores(): Observable<{ data: Contenedor[] }> { // <-- Asegúrate de que el método está aquí
    // Tu backend devuelve { data: results }, así que accedemos a .data
    // Aquí el tipo de retorno debe ser Observable<{ data: Contenedor[] }> porque tu backend responde con un objeto { data: [...] }
    return this.http.get<any>(`${this.apiUrl}/get-all`);
  }
}