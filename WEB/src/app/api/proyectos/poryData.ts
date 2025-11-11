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

export interface DeleteProyectoRequest {
    id: number;
    justificacion: string; // Ahora la justificación es obligatoria
}

export async function DeleteProyecto(request: DeleteProyectoRequest): Promise<{success: boolean, message: string}> {
    const url = ConnectA.api;
    try {
        console.log(`🗑️ Eliminando proyecto ${request.id} con justificación...`);
        
        // Enviar la eliminación con justificación
        const result = await fetch(`${url}/proyectos/${request.id}`, {
            method: 'DELETE',
            headers: {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify({
                justificacion: request.justificacion
            })
        });
        
        const data = await result.json();
        
        if (data.status === 200) {
            return { 
                success: true, 
                message: "Proyecto eliminado exitosamente" 
            };
        }
        
        return { 
            success: false, 
            message: data.msg || "Error al eliminar el proyecto" 
        };
        
    } catch (e) {
        console.log("Error > API > DeleteProyecto >\n" + e);
        return { 
            success: false, 
            message: "Error de conexión" 
        };
    }
}

// Función simple sin justificación (para compatibilidad)
export async function DeleteProyectoSimple(id: number): Promise<boolean> {
    const url = ConnectA.api;
    try {
        const result = await fetch(`${url}/proyectos/${id}`, {
            method: 'DELETE',
            headers: {
                'Content-Type': 'application/json'
            }
        });
        
        const data = await result.json();
        return data.status === 200;
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