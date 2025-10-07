import { ConnectA } from "../../../config/index";

export async function ProyTipo(proy: string): Promise<TipoProps[]> {
    const url = ConnectA.api;

    try {
        const result = await fetch(url + "/tipo/" + proy);
        const proydata = await result.json();
        if (proydata.status === 200) {
            return proydata.data.data as TipoProps[];
        }
        return [];
    } catch (e) {
        console.log("Error > API > ProyTipo >\n" + e);
        return [];
    }
}

export interface TipoProps {
    id?: number;
    proy: number;
    tipo: string;
    subtipo: string;
}
