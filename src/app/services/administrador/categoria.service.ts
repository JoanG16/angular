import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { map } from 'rxjs/operators'; // Asegúrate de importar 'map'
import { Categoria, CategoriaResponse } from '../../interfaces/categoria.interface'; // Asegúrate de que la ruta sea correcta

@Injectable({
  providedIn: 'root'
})
export class CategoriaService {
  private baseUrl = 'http://localhost:3000/v1/api/categorias'; // Asegúrate de que esta URL base sea correcta

  constructor(private http: HttpClient) { }

  // Este método ahora mapea la respuesta del backend para devolver directamente un array de Categoria[]
  getAllCategorias(): Observable<Categoria[]> {
    // Asume que el backend devuelve un objeto como { statusCode: ..., status: ..., message: ..., data: Categoria[] }
    // Usamos 'map' para extraer solo el array 'data' de ese objeto de respuesta.
    return this.http.get<CategoriaResponse>(`${this.baseUrl}/get-all`).pipe(
      map(response => response.data)
    );
  }

  // Puedes añadir más métodos CRUD (getOne, create, update, delete) aquí si los necesitas en el futuro,
  // siguiendo un patrón similar de manejo de respuesta.
  getOneCategoria(id: number): Observable<Categoria> {
    return this.http.get<any>(`${this.baseUrl}/get-one/${id}`).pipe(
      map(response => response.data)
    );
  }

  createCategoria(categoria: Partial<Categoria>): Observable<any> {
    return this.http.post(`${this.baseUrl}/create`, categoria);
  }

  updateCategoria(id: number, categoria: Partial<Categoria>): Observable<any> {
    return this.http.put(`${this.baseUrl}/update/${id}`, categoria);
  }

  deleteCategoria(id: number): Observable<any> {
    return this.http.delete(`${this.baseUrl}/delete/${id}`);
  }
}