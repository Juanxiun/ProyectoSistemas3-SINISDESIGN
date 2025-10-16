export interface GananciaModel {
    proy: number;
    total: number;
    pago: number;
    deuda: number;
}

export interface SolicitadoModel {
    departamento: string;
    cantidad: number;
}

export interface ProyTerminadoModel {
    proy: number;
    terminado: number;
    pendiente: number;
}

export interface AvanceProyectoModel {
    fase: string;
    terminado: number;
    pendiente?: number; 
}

export interface TipoProyectoModel {
    tipo: string;
    subtipo: string;
    cantidad_proyectos: number;
}