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
export async function DeleteProyecto(id: number): Promise<boolean> {
    const url = ConnectA.api;
    try {
        const result = await fetch(`${url}/proyectos/${id}`, {
            method: 'DELETE',
            headers: {
                'Content-Type': 'application/json'
            }
        });
        
        const data = await result.json();
        
        if (data.status === 200) {
            return true;
        }
        return false;
    } catch (e) {
        console.log("Error > API > DeleteProyecto >\n" + e);
        return false;
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
    arq_nombre?: string;
    arq_apellido?: string;
    cli_nombre?: string;
    cli_apellido?: string;
    cli_ci?: number;
}
