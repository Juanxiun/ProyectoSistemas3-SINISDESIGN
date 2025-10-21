// deno-lint-ignore-file no-explicit-any
export default interface ArquitectoModel {
  codigo?: string;
  ci: number;
  nombre: string;
  apellido: string;
  telefono: number;
  correo: string;
  admin: number;
  password: string;
  estado: number;
}

export interface ListArquitecto {
  codigo: string;
  nombres: string;
  correo: string;
  telefono: string;
  especializacion?: any[];
  foto: string;
}

export interface ListArqFullData{
  codigo: string;
  nombres: string;
  xp: string;
  admin: number;
  foto: string;
  universidad: string;
  titulacion: string;
  descripcion: string;
  especializacion?: any[];
}