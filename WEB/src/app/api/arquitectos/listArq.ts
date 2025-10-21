import { ConnectA } from "../../../config/index";

export async function ListArquitectos(
    action: number,
): Promise<ListArquitecto[] | ListArqFullData[]> {
    const url = ConnectA.api;

    try {
        const result = await fetch(
            url + "/arquitectos/list/arq/data/" + action,
        );
        const listArq = await result.json();

        if (listArq.status === 200) {
            return action === 1
                ? listArq.data.data as ListArquitecto[]
                : listArq.data.data as ListArqFullData[];
        }
        return [];
    } catch (e) {
        console.log(e);
        return [];
    }
}

export interface ListArquitecto {
    codigo: string;
    nombres: string;
    correo: string;
    telefono: string;
    especializacion?: any[];
    foto: string;
}

export interface ListArqFullData {
    codigo: string;
    nombres: string;
    xp: string;
    admin: number;
    foto: string;
    universidad: string;
    titulacion: string;
    descripcion: string;
    especializacion?: any[];
}
