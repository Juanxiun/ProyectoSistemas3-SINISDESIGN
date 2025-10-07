import { ConnectA } from "../../../config/index";

export async function ProyFase(fase: string): Promise<DocumentoProps[]> {
    const url = ConnectA.api;

    try {
        const result = await fetch(url + "/documento/" + fase);
        const proydata = await result.json();
        if (proydata.status === 200) {
            return proydata.data.data as DocumentoProps[];
        }
        return [];
    } catch (e) {
        console.log("ERROR > API > ProyPago >\n" + e);
        return [];
    }
}

export default interface DocumentoProps{
    id?: number;
    fase: number;
    nombre: string;
    tipo: string;
    documento: string | File;
    fecha: string;
}

