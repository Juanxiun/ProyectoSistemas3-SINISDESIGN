// deno-lint-ignore-file
import { ConnectA } from "../../../config/index";

export async function Ganancias(data: props): Promise<GananciaProp[]> {
    const url = ConnectA.api;
    try {
        const result = await fetch(
            url + "reporte/ganancia" +
                `?arq=${data.id}&startDate=${data.start}&endDate=${data.end}`,
        );

        const ganacia = await result.json();
        if (ganacia.status === 200) {
            return ganacia.data.data as GananciaProp[];
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

export interface GananciaProp {
    proy: number;
    total: number;
    pago: number;
    deuda: number;
}
