// src/app/interfaces/oferta.interface.ts

export interface Oferta {
    id_oferta: number;
    tipo_contenido: 'promocion' | 'tiktok' | 'youtube'; // Define los tipos posibles
    valor_contenido: string; // El texto de la promoción o la URL del video
    orden?: number | null; // Opcional, puede ser null
    activo: boolean; // Si la oferta está activa o no
    creado_en?: string; // Fechas como string si vienen del backend
    actualizado_en?: string;
}

// Interfaces de respuesta para la API, siguiendo el patrón { statusCode, status, message, data }
export interface OfertaResponse {
    statusCode: number;
    status: string;
    message: string;
    data: Oferta[]; // Para respuestas con múltiples ofertas (ej. getAll)
}

export interface SingleOfertaResponse {
    statusCode: number;
    status: string;
    message: string;
    data: Oferta; // Para respuestas con una sola oferta (ej. getOne, create, update)
}
