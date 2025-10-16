import { ConnectA } from "../../../config/index";

export async function ListProyectos(usr: string): Promise<ListProps[]> {
    const url = ConnectA.api;
    try {
        const result = await fetch(url + "/proyectos/p/list/" + usr);
        const listproy = await result.json();
        if (listproy.status === 200) {
            return listproy.data.data as ListProps[];
        }

        return [];
    } catch (e) {
        console.log("Error > API > listProy > \n", e);
        return [];
    }
}

export interface ListProps {
    id?: number;
    arq: string;
    nombre: string;
    costo: number;
    imagen: string;
    direccion: string;
    est: number;
}
