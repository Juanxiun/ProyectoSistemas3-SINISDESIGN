// deno-lint-ignore-file
import { ConnectA } from "../../../config/index";

export async function Departamentos(data: props): Promise<DepartamentoProp[]> {
    const url = ConnectA.api;
    try {
        const result = await fetch(
            `${url}/reporte/departamentos?arq=${data.id}&pais=${data.pais}`,
        );

        const departamento = await result.json();
        if (departamento.status === 200) {
            return departamento.data.data as DepartamentoProp[];
        }

        return [];
    } catch (e) {
        console.log(e);
        return [];
    }
}

export interface props {
    id: string;
    pais: string;
}

export interface DepartamentoProp {
    departamento: string;
    cantidad: number;
}
