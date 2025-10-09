import { ConnectA } from "../../../config/index";

export async function ProyPago(proy: string): Promise<PagoProps[]> {
    const url = ConnectA.api;

    try {
        const result = await fetch(url + "/pago/" + proy);
        const proydata = await result.json();
        if (proydata.status === 200) {
            return proydata.data.data as PagoProps[];
        }
        return [];
    } catch (e) {
        console.log("ERROR > API > ProyPago >\n" + e);
        return [];
    }
}

export default interface PagoProps{
    id?: number;
    proy: number;
    titulo: string;
    monto: number;
    fecha: string;
}