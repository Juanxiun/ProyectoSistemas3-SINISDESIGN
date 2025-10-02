import cli from "../../../../../database/connect.ts";
import EspecializacionModel from "../model.ts";

interface res {
    data?: EspecializacionModel[];
    std: number;
}

export const SelectQuery = async (arq: string, id?: number): Promise<res> => {
    try {
        const query = `
      SELECT id, arq, especialidad
      FROM especializaciones
      WHERE arq = ?
      ${id ? "AND id = ?" : ""}
    `;

        const params = id ? [arq, id] : [arq];

        const [rows] = await cli.query(query, params);
        const data = Array.isArray(rows) ? (rows as EspecializacionModel[]) : [];

        return {
            data: data,
            std: 200,
        };
    } catch (error) {
        console.error("Error en la query: Especializaciones > Select >", error);
        return {
            data: [],
            std: 500,
        };
    }
};


export const CreateQuery = async (data: EspecializacionModel): Promise<res> => {
    try {
        const query = `
      INSERT INTO especializaciones (arq, especialidad)
      VALUES (?, ?)
    `;
        const params = [
            data.arq,
            data.especialidad,
        ];

        await cli.query(query, params);

        return {
            std: 200,
        };
    } catch (error) {
        console.log("Error en la query: Especializaciones > Create >\n" + error);
        return {
            std: 500,
        };
    }
};

export const UpdateQuery = async (data: EspecializacionModel): Promise<res> => {
    try {
        const query = `
      UPDATE especializaciones
      SET 
        especialidad = ?
      WHERE id = ?
      AND arq = ?
    `;
        const params = [
            data.especialidad,
            data.id ?? 0,
            data.arq,
        ];

        await cli.query(query, params);

        return { std: 200 };
    } catch (error) {
        console.log("Error en la query: Especializaciones > Update >\n", error);
        return { std: 500 };
    }
};


export const DeleteQuery = async (id: number, arq: string): Promise<res> => {
    try {
        await cli.query(
            `DELETE FROM especializaciones WHERE id = ? AND arq = ?`,
            [id, arq]
        );
        return {
            std: 200,
        };
    } catch (error) {
        console.log("Error en la query: Especializaciones > Delete >\n" + error);
        return {
            std: 500,
        };
    }
};