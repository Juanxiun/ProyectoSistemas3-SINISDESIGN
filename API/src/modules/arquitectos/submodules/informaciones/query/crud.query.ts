import cli from "../../../../../database/connect.ts";
import InformacionModel from "../model.ts";
import { fileBlob } from "../../../../../libs/converFile.ts";

interface res {
    data?: InformacionModel[];
    std: number;
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
        const data = Array.isArray(rows) ? (rows as InformacionModel[]) : [];

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
        const query = `
      INSERT INTO informaciones (arq, foto, universidad, titulacion, descripcion)
      VALUES (?, ?, ?, ?, ?)
    `;


        const fotoBlob =
            data.foto instanceof File ? await fileBlob(data.foto) : data.foto;

        const params = [
            data.arq,
            fotoBlob,
            data.universidad,
            data.titulacion,
            data.descripcion,
        ];


        await cli.execute(query, params);

        return {
            std: 200,
        };
    } catch (error) {
        console.log("Error en la query: Informaciones > Create >\n" + error);
        return {
            std: 500,
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

export const DeleteQuery = async (id: number, arq: string): Promise<res> => {
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