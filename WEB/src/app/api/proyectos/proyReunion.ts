import { ConnectA } from "../../../config/index";

export async function ProyReunion(proy: string): Promise<ReunionProps[]> {
    const url = ConnectA.api;

    try {
        const result = await fetch(url + "/reunion/" + proy);
        const proydata = await result.json();
        if (proydata.status === 200) {
            return proydata.data.data as ReunionProps[];
        }
        return [];
    } catch (e) {
        console.log("ERROR > API > ProyReunion >\n" + e);
        return [];
    }
}

export interface ReunionProps {
    id?: number;
    proy: number;
    titulo: string;
    descripcion: string;
    fecha: string;
    estado?: number;
}
