// deno-lint-ignore-file
import { ConnectA } from "../../../config/index";

export async function Tipos(data: props): Promise<TipoProp[]> {
    const url = ConnectA.api;
    try {
        const result = await fetch(
            url + "reporte/tipo-proyecto" +
                `?arq=${data.id}&startDate=${data.start}&endDate=${data.end}`,
        );

        const tipo = await result.json();
        if (tipo.status === 200) {
            return tipo.data.data as TipoProp[];
        }

        return [];
    } catch (e) {
        console.log(e);
        return [];
    }
}

export interface props {
    id: string;
    start: string;
    end: string;
}

export interface TipoProp {
    tipo: string;
    subtipo: string;
    cantidad_proyectos: number;
}
