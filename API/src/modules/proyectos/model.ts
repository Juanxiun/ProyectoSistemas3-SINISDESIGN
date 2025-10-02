export default interface ProyectoModel {
  id?: number;
  arq: string;
  cli: number;
  nombre: string;
  inicio: string;
  final?: string;
  costo: number;
  imagen: string | File;
  est?: number;
}


