// src/app/interfaces/producto.interface.ts
import { Categoria } from './categoria.interface';
import { Local } from './locales.interface';
export interface Producto {
    id_producto: number;
    nombre: string;
    // REMOVIDO: precio: number;
    descripcion_adicional?: string;
    id_categoria: number;
    categoria?: Categoria;
    locales?: Local[];
    creado_en?: string;
}

export interface ProductoResponse {
    statusCode: number;
    status: string;
    message: string;
    data: Producto[];
}

export interface SingleProductoResponse {
    statusCode: number;
    status: string;
    message: string;
    data: Producto;
}