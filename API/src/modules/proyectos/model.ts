export default interface ProyectoModel {
  id?: number;
  arq: string;
  cli: number;
  nombre: string;
  inicio: string;
  final?: string;
  costo: number;
  imagen?: string | File;
  est?: number;
}
/* Submodelos para querys adicionales */
export interface ProyectoList {
  id?: number;
  arq: string;
  nombre: string;
  costo: number;
  imagen: string;
  direccion: string;
  est: number;
}

export interface ProyectoViewList{
  nombre: string;
  imagen: string;
  direccion: string;
  est: number;
  tipo: string;
  subtipo: string;
}