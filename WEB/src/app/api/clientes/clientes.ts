import { ConnectA } from "../../../config/index";

export async function GetClientes(): Promise<ClienteProps[]> {
    const url = ConnectA.api;

    try {
        const result = await fetch(url + "/clientes");
        const res = await result.json();

        if (res.std === 200 || res.status === 200) {
            return res.data as ClienteProps[];
        }

        return [];
    } catch (e) {
        console.log("ERROR > API > Clientes >\n" + e);
        return [];
    }
}

export default interface ClienteProps {
    ci: number;
    nombre: string;
    apellido: string;
    telefono: number;
    correo: string;
    estado: number;
}
