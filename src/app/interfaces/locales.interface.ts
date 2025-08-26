// src/app/interfaces/locales.interface.ts
import { Producto } from './producto.interface';
import { Socio } from './socio.interface';
import { Contenedor } from './contenedor.interface';

export interface Local {
    id_local: number;
    nombre_del_negocio: string;
    nombre_del_dueno: string;
    codigo_local: string;
    descripcion?: string; // Opcional
    telefono?: string;    // Opcional
    facebook?: string;    // Opcional
    instagram?: string;   // Opcional
    tiktok?: string;      // Opcional
    ruc: string;         // Nuevo campo
    correo: string;      // Nuevo campo
    id_contenedor: number;
    imagen_urls?: string[]; // Opcional
    creado_en?: string; // Opcional

    productos?: Producto[];
    socio?: Socio;
    contenedor?: Contenedor;
    activo: boolean;
}

// Interfaces de respuesta de la API, siguiendo el patrón { statusCode, status, message, data }
export interface LocalResponse {
    statusCode: number;
    status: string;
    message: string;
    data: Local[];
}

export interface SingleLocalResponse {
    statusCode: number;
    status: string;
    message: string;
    data: Local;
}

export interface contenedor {
    id_contenedor: number;
    numero_contenedor: string;
    bloque: string;
    geom?: any;
    creado_en?: string;
    socioId?: number;
}
