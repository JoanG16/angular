// src/app/interfaces/user.interface.ts
import { Local } from './locales.interface';

export interface User {
  id_user?: number;
  username: string;
  email: string; // Nuevo campo: correo electrónico
  role: 'admin' | 'local_owner' | 'viewer'; // Definir los roles posibles
  id_local?: number; // Opcional, ya que los administradores no tienen un local
  created_at?: string;
  local?: Local; // Para incluir la información del local si la API la devuelve
}

// Interfaces para las respuestas de la API
export interface UserResponse {
  statusCode: number;
  status: string;
  message: string;
  data: User[];
}

export interface SingleUserResponse {
  statusCode: number;
  status: string;
  message: string;
  data: User;
}

// En tu AuthService
interface LoginResponse {
  token: string;
  role: string;
  id_local?: number | null;
  status: number;
  success: string;
  message: string;
}
