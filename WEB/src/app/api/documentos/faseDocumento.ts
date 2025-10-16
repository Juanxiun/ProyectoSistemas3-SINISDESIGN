import { ConnectA } from "../../../config/index";

export default interface DocumentoProps {
    id?: number;
    fase: number;
    nombre: string;
    tipo: string;
    documento: string | File;
    fecha: string;
}

const API_ENDPOINT = ConnectA.api + "/documento";
//obtener
export async function getDocumentosByFase(fase: string, id?: string): Promise<DocumentoProps[]> {
    let url = `${API_ENDPOINT}/${fase}`;
    if (id) {
        url = `${API_ENDPOINT}/${fase}/${id}`;
    }

    try {
        const result = await fetch(url);
        const proydata = await result.json();

        if (proydata.status === 200) {
            return proydata.data.data as DocumentoProps[];
        }
        return [];
    } catch (e) {
        console.log("ERROR > API > getDocumentosByFase >\n" + e);
        return [];
    }
}
//crear
export async function createDocumento(documento: Omit<DocumentoProps, 'id' | 'documento'>, file: File): Promise<boolean> {
    const url = API_ENDPOINT;
    const formData = new FormData();

    formData.append("fase", documento.fase.toString());
    formData.append("nombre", documento.nombre);
    formData.append("tipo", documento.tipo);
    formData.append("fecha", documento.fecha);
    formData.append("documento", file, documento.nombre);

    try {
        const result = await fetch(url, {
            method: "POST",
            body: formData,
        });

        if (!result.ok) {
            const errorBody = await result.text();
            console.error(`Error de red/servidor (${result.status} ${result.statusText}):`, errorBody);
            return false;
        }

        const responseData = await result.json();


        if (responseData.status === 200) {
            return true;
        }

        const errorDetail = responseData.data.error || responseData.data.msg || `Respuesta inesperada (status: ${responseData.status || 'N/A'}). Datos: ${JSON.stringify(responseData)}`;
        console.error("Error al crear documento:", errorDetail);

        return false;
    } catch (e) {
        console.log("ERROR > API > createDocumento >\n" + e);
        return false;
    }
}
//actualizar
export async function updateDocumento(documento: DocumentoProps, file?: File): Promise<boolean> {
    if (!documento.id) {
        console.error("ERROR > API > updateDocumento > ID es requerido.");
        return false;
    }
    const url = `${API_ENDPOINT}/${documento.id}`;
    const formData = new FormData();

    formData.append("fase", documento.fase.toString());
    formData.append("nombre", documento.nombre);
    formData.append("tipo", documento.tipo);
    formData.append("fecha", documento.fecha);

    if (file) {
        formData.append("documento", file, documento.nombre);
    }

    try {
        const result = await fetch(url, {
            method: "PUT",
            body: formData,
        });

        if (!result.ok) {
            const errorBody = await result.text();
            console.error(`Error de red/servidor (${result.status} ${result.statusText}):`, errorBody);
            return false;
        }

        const responseData = await result.json();

        if (responseData.status === 200) {
            return true;
        }

        const errorDetail = responseData.data.error || responseData.data.msg || `Respuesta inesperada (status: ${responseData.status || 'N/A'}). Datos: ${JSON.stringify(responseData)}`;
        console.error("Error al actualizar documento:", errorDetail);

        return false;
    } catch (e) {
        console.log("ERROR > API > updateDocumento >\n" + e);
        return false;
    }
}
//eliminar
export async function deleteDocumento(id: number): Promise<boolean> {
    const url = `${API_ENDPOINT}/${id}`;

    try {
        const result = await fetch(url, {
            method: "DELETE",
        });

        if (!result.ok) {
            const errorBody = await result.text();
            console.error(`Error de red/servidor (${result.status} ${result.statusText}):`, errorBody);
            return false;
        }

        const responseData = await result.json();

        if (responseData.status === 200) {
            return true;
        }

        const errorDetail = responseData.data.error || responseData.data.msg || `Respuesta inesperada (status: ${responseData.status || 'N/A'}). Datos: ${JSON.stringify(responseData)}`;
        console.error("Error al eliminar documento:", errorDetail);

        return false;
    } catch (e) {
        console.log("ERROR > API > deleteDocumento >\n" + e);
        return false;
    }
}

export const ProyFase = getDocumentosByFase;