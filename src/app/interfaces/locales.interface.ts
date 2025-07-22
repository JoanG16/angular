// src/app/interfaces/locales.interface.ts
import { Producto } from './producto.interface'; // Importa la interfaz Producto
import { Socio } from './socio.interface'; // Importa la interfaz Socio si es necesaria para el local (en este caso, no para el detalle del local en sí, pero es común)
import { Contenedor } from './contenedor.interface'; // Importa la interfaz Contenedor si es necesaria para el local

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
    id_contenedor: number;
    // Asumo que tu backend devuelve imagen_urls como un array de strings
    imagen_urls?: string[]; // Opcional
    creado_en?: string; // Opcional, si lo devuelve el backend

    // Agrega la propiedad 'productos' para los productos asociados a este local
    // Esta propiedad debería ser un array de la interfaz Producto (que a su vez contiene la categoría)
    productos?: Producto[];

    // Si tu local puede tener información de socio o contenedor directamente, puedes añadirlo aquí también:
    socio?: Socio; // Opcional: si el local tiene un socio asociado
    contenedor?: Contenedor; // Opcional: si el local tiene un contenedor asociado
}

// Interfaces de respuesta de la API, siguiendo el patrón { statusCode, status, message, data }
export interface LocalResponse {
    statusCode: number;
    status: string;
    message: string;
    data: Local[]; // Para respuestas con múltiples locales (ej. getAll)
}

export interface SingleLocalResponse {
    statusCode: number;
    status: string;
    message: string;
    data: Local; // Para respuestas con un solo local (ej. getOne, create, update)
}
