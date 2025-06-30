// src/app/services/page/producto.service.ts
import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { map } from 'rxjs/operators';
import { Producto, ProductoResponse, SingleProductoResponse } from '../../interfaces/producto.interface';

interface ProductoPayload {
  nombre: string;
  // REMOVIDO: precio: number;
  descripcion_adicional?: string;
  id_categoria: number;
  locales: number[];
}

@Injectable({ providedIn: 'root' })
export class ProductoService {
  private baseUrl = 'http://localhost:3000/v1/api/productos';

  constructor(private http: HttpClient) { }

  getAllProductos(): Observable<Producto[]> {
    return this.http.get<ProductoResponse>(`${this.baseUrl}/get-all`).pipe(
      map(response => response.data)
    );
  }

  getOneProducto(id: number): Observable<Producto> {
    return this.http.get<SingleProductoResponse>(`${this.baseUrl}/get-one/${id}`).pipe(
      map(response => response.data)
    );
  }

  createProducto(data: ProductoPayload): Observable<any> {
    return this.http.post(`${this.baseUrl}/create`, data);
  }

  updateProducto(id: number, data: Partial<ProductoPayload>): Observable<any> {
    return this.http.put(`${this.baseUrl}/update/${id}`, data);
  }

  deleteProducto(id: number): Observable<any> {
    return this.http.delete(`${this.baseUrl}/delete/${id}`);
  }
}
