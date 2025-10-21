// deno-lint-ignore-file
import { ConnectA } from "../../../config/index";

export async function Terminados(data: props): Promise<TerminadoProp[]> {
    const url = ConnectA.api;
    try {
        const result = await fetch(
            url + "reporte/proy-terminado" +
                `?arq=${data.id}&startDate=${data.start}&endDate=${data.end}`,
        );

        const terminado = await result.json();
        if (terminado.status === 200) {
            return terminado.data.data as TerminadoProp[];
        }

        return [];
    } catch (e) {
        console.log(e);
        return [];
    }
}

interface props {
    id: string;
    start: string;
    end: string;
}

export interface TerminadoProp {
    proy: number;
    terminado: number;
    pendiente: number;
}
