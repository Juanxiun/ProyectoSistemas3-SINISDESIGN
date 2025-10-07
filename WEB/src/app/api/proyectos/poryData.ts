import { ConnectA } from "../../../config/index";

export async function ProyData(usr: string, id: string): Promise<ProyProps[]> {
    const url = ConnectA.api;
    try {
        const result = await fetch(url + "/proyectos/" + usr + "/" + id);
        const proydata = await result.json();
        if (proydata.status === 200) {
            return proydata.data.data as ProyProps[];
        }
        return [];
    } catch (e) {
        console.log("Error > API > ProyData >\n" + e);
        return [];
    }
}

export interface ProyProps {
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
