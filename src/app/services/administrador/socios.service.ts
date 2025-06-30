import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { map } from 'rxjs/operators'; // Importa el operador map
import { Socio } from '../../interfaces/socio.interface'; // Asegúrate de la ruta

@Injectable({
  providedIn: 'root'
})
export class SociosService {
  private apiUrl = 'http://localhost:3000/v1/api/socios'; // Asegúrate de que esta URL sea correcta

  constructor(private http: HttpClient) { }

  getAllSocios(): Observable<Socio[]> {
    // Tu backend devuelve { data: results }, así que accedemos a .data
    return this.http.get<{ data: Socio[] }>(`${this.apiUrl}/get-all`).pipe(
      map(response => response.data)
    );
  }

  getOneSocio(id: number): Observable<Socio> {
    // Si este endpoint también devuelve { data: Socio }, necesitarías un map aquí también
    return this.http.get<Socio>(`${this.apiUrl}/get-one/${id}`);
  }

  createSocio(socio: Partial<Socio>): Observable<Socio> { // 'Partial' porque id_socio no se envía
    return this.http.post<Socio>(`${this.apiUrl}/create`, socio);
  }

  updateSocio(id: number, socio: Partial<Socio>): Observable<Socio> {
    return this.http.put<Socio>(`${this.apiUrl}/update/${id}`, socio);
  }

  deleteSocio(id: number): Observable<void> {
    return this.http.delete<void>(`${this.apiUrl}/delete/${id}`);
  }

  
}