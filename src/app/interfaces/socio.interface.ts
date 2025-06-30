export interface Socio {
    id_socio: number;
    nombres: string; // Campo para el nombre
    apellido: string;
    telefono?: string;
    correo?: string;
    creado_en?: Date; // Si lo recibes como Date
}