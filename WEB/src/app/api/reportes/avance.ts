// deno-lint-ignore-file
import { ConnectA } from "../../../config/index";

export async function Avances(data: props): Promise<AvanceProp[]> {
    const url = ConnectA.api;
    try {
        const result = await fetch(
            url + "reporte/avance-proyecto" +
                `?arq=${data.id}&startDate=${data.start}&endDate=${data.end}`,
        );

        const avances = await result.json();
        if (avances.status === 200) {
            return avances.data.data as AvanceProp[];
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

export interface AvanceProp {
    fase: string;
    terminado: number;
}
