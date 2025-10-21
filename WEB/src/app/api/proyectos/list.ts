// deno-lint-ignore-file no-sloppy-imports
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

export async function ListProyectosView(): Promise<ProyectoViewList[]> {
    const url = ConnectA.api;
    try {
        const result = await fetch(url + "/proyectos/p/list/x");
        const listproy = await result.json();
        if (listproy.status === 200) {
            return listproy.data.data as ProyectoViewList[];
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

export interface ProyectoViewList{
  nombre: string;
  imagen: string;
  direccion: string;
  est: number;
  tipo: string;
  subtipo: string;
}