import cli from "../../../../../database/connect.ts";
import InformacionModel from "../model.ts";
import { fileBlob } from "../../../../../libs/converFile.ts";
import { conver64, typeFile } from "../../../../../libs/conver64.ts";
interface res {
    data?: any;
    std: number;
}


function base64ToUint8(base64: string): Uint8Array {
    if (base64.includes(',')) base64 = base64.split(',')[1];
    const binary = atob(base64);
    const len = binary.length;
    const u8 = new Uint8Array(len);
    for (let i = 0; i < len; i++) u8[i] = binary.charCodeAt(i);
    return u8;
}

export const SelectQuery = async (arq: string, id?: number): Promise<res> => {
    try {
        const query = `
      SELECT id, arq, foto, universidad, titulacion, descripcion
      FROM informaciones
      WHERE arq = ?
      ${id ? "AND id = ?" : ""}
    `;

        const params = id ? [arq, id] : [arq];

        const [rows] = await cli.query(query, params);
        const data = Array.isArray(rows)
            ? (rows as any[]).map(row => ({
                ...row,
                foto: row.foto ? conver64(typeFile.jpg, row.foto) : null,
            })) as InformacionModel[]
            : [];

        return {
            data: data,
            std: 200,
        };
    } catch (error) {
        console.error("Error en la query: Informaciones > Select >", error);
        return {
            data: [],
            std: 500,
        };
    }
};


export const CreateQuery = async (data: InformacionModel): Promise<res> => {
    try {
        if (!data.arq) {
            return { std: 400, data: { msg: "Campo 'arq' requerido" } };
        }


        const [existingRows] = await cli.query(
            "SELECT id, foto FROM informaciones WHERE arq = ?",
            [data.arq]
        );

        const exists = Array.isArray(existingRows) && existingRows.length > 0;
        const existingData = exists ? existingRows[0] as any : null;


        let fotoToSave = null;

        if (data.foto instanceof File) {

            fotoToSave = await fileBlob(data.foto);
        } else if (typeof data.foto === "string" && data.foto.trim() !== "") {

            try {
                const base64Data = data.foto.includes(',') ? data.foto.split(',')[1] : data.foto;
                fotoToSave = base64ToUint8(base64Data);
            } catch (e) {
                console.error("Error convirtiendo base64:", e);
            }
        }


        const params: any[] = [];
        let query = '';

        if (exists) {

            query = `
                UPDATE informaciones 
                SET 
                    universidad = ?,
                    titulacion = ?,
                    descripcion = ?
                    ${fotoToSave ? ', foto = ?' : ''}
                WHERE arq = ?
            `;

            params.push(
                data.universidad || '',
                data.titulacion || '',
                data.descripcion || ''
            );

            if (fotoToSave) {
                params.push(fotoToSave);
            }

            params.push(data.arq);

        } else {

            if (!fotoToSave) {
                return {
                    std: 400,
                    data: { msg: "La foto es obligatoria para crear nuevo registro" }
                };
            }

            query = `
                INSERT INTO informaciones (arq, foto, universidad, titulacion, descripcion)
                VALUES (?, ?, ?, ?, ?)
            `;

            params.push(
                data.arq,
                fotoToSave,
                data.universidad || '',
                data.titulacion || '',
                data.descripcion || ''
            );
        }

        await cli.execute(query, params);

        return {
            std: 200,
            data: {
                msg: exists ? "Información actualizada correctamente" : "Información creada correctamente"
            }
        };

    } catch (error) {
        console.error("Error en CreateQuery:", error);
        return {
            std: 500,
            data: {
                msg: "Error al procesar la información",
                error: String(error)
            }
        };
    }
};

export const UpdateQuery = async (data: InformacionModel): Promise<res> => {
    try {

        let fotoBlob: string | Uint8Array | null = data.foto as string;

        if (data.foto instanceof File) {
            fotoBlob = await fileBlob(data.foto);
        }

        const query = `
      UPDATE informaciones
      SET 
        foto = ?, universidad = ?, titulacion = ?, descripcion = ?
      WHERE id = ?
      AND arq = ?
    `;
        const params = [
            fotoBlob,
            data.universidad,
            data.titulacion,
            data.descripcion,
            data.id ?? 0,
            data.arq,
        ];


        await cli.execute(query, params);

        return { std: 200 };
    } catch (error) {
        console.log("Error en la query: Informaciones > Update >\n", error);
        return { std: 500 };
    }
};

export const DeleteQuery = async (id: number | undefined, arq: string): Promise<res> => {
    try {
        await cli.query(
            `DELETE FROM informaciones WHERE id = ? AND arq = ?`,
            [id, arq]
        );
        return {
            std: 200,
        };
    } catch (error) {
        console.log("Error en la query: Informaciones > Delete >\n" + error);
        return {
            std: 500,
        };
    }
};