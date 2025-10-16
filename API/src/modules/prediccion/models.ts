
export interface ReqProyModel{
    id: number;
    tipo: string;
    subtipo: string;
    inicio: string;
}

export interface ProyGestion{
    id: number;
    inicio: string;
    final?: string;
    fase: string;
    fase_ini: string;
    fase_fin?: string;
}

export interface TipoProyPreModel{
    id: number;
    inicio: number;
    final:  number;
    day: number;
}

export interface FaseProyPreModel{
    fase: string;
    proy: number;
    day: number;
    hour: number;
}