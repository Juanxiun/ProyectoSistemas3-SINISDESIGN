import { ConnectA } from "../../../config/index";

export async function ProyFase(proy: string): Promise<FaseProps[]> {
    const url = ConnectA.api;

    try {
        const result = await fetch(url + "/fase-proyectos/" + proy);  
        const proydata = await result.json();
        if (proydata.status === 200) {
            return proydata.data.data as FaseProps[];
        }
        return [];
    } catch (e) {
        console.log("ERROR > API > ProyFase >\n" + e);
        return [];
    }
}
export interface FaseProps{
    id?: number;
    proy: number;
    fase: string;
    detalle: string;
    inicio: string;
    final?: string;
    estado?: number;
}
