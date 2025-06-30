// src/app/interfaces/categoria.interface.ts
export interface Categoria {
    id_categoria: number;
    nombre_categoria: string;
}

export interface CategoriaResponse {
    statusCode: number;
    status: string;
    message: string;
    data: Categoria[];
}