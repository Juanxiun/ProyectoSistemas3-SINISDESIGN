import { ConnectA } from "../../../config/index";

export async function ObtenerHistorialPagos(): Promise<any[]> {
    const url = ConnectA.api + "/historial-pagos";

    try {
        const res = await fetch(url);
        const json = await res.json();

        // LOG para verificar estructura
        console.log("Respuesta API historial:", json);

        if (json.status === 200 && json.data && Array.isArray(json.data.data)) {
            return json.data.data; // ← LA PARTE CORRECTA
        }

        console.warn("Historial vacío o respuesta inesperada:", json);
        return [];

    } catch (err) {
        console.error("Error al obtener historial:", err);
        return [];
    }
}
