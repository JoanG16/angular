export interface Contenedor {
    id_contenedor: number;
    numero_contenedor: string;
    bloque: string;
    geom?: {
        type: string; // Ej. 'Polygon'
        coordinates: number[][][]; // Array de anillos, cada anillo es array de [lng, lat]
    };
    socioId?: number; // El ID del socio asociado
    socio?: { // Si Sequelize incluye el objeto socio directamente en la respuesta
        id_socio: number;
        nombres: string;
        apellido: string;
        // ... otros campos del socio si se incluyen
    };
    creado_en?: string;
}

export interface ContenedorResponse {
    statusCode: number;
    status: string;
    message: string;
    data: Contenedor[];
}

export interface SingleContenedorResponse {
    statusCode: number;
    status: string;
    message: string;
    data: Contenedor;
}