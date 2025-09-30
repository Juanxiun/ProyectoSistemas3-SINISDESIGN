import cli from "../../../../../database/connect.ts";
import DocumentoModel from "../model.ts";

interface res {
  data?: DocumentoModel[];
  std: number;
}

// SELECT
export const SelectQuery = async (fase: number, id?: number): Promise<res> => {
  try {
    const query = `SELECT id, fase, nombre, documento
      FROM documentos
      WHERE fase = ?${id ? " AND id = ?" : ""}
    `;
    const params = id ? [fase, id] : [fase];

    const [rows] = await cli.query(query, params);
    const documentos = Array.isArray(rows) ? (rows as DocumentoModel[]) : [];

    return { data: documentos, std: 200 };
  } catch (error) {
    console.error("Error en la query: Documento_Fase > Select >", error);
    return { data: [], std: 500 };
  }
};

// CREATE
export const CreateQuery = async (data: DocumentoModel): Promise<res> => {
  try {
    let documento: Uint8Array | null = null;
    if (data.documento) {
      const base64 = data.documento.split(",")[1];
      documento = Uint8Array.from(atob(base64), (c) => c.charCodeAt(0));
    }

    const query = `INSERT INTO documentos (fase, nombre, documento, fecha)
      VALUES (?, ?, ?)
    `;
    const params = [
      data.fase,
      data.nombre,
      documento,
      data.fecha
    ];

    await cli.query(query, params);

    return { std: 200 };
  } catch (error) {
    console.error("Error en la query: Documento_Fase > Create >", error);
    return { std: 500 };
  }
};

// UPDATE
export const UpdateQuery = async (data: DocumentoModel): Promise<res> => {
  try {

    let documento: Uint8Array | null = null;
    if (data.documento) {
      const base64 = data.documento.split(",")[1];
      documento = Uint8Array.from(atob(base64), (c) => c.charCodeAt(0));
    }

    const query = `UPDATE documentos
      SET fase = ?, nombre = ?, documento = ?
      WHERE id = ?
    `;
    const params = [
      data.fase,
      data.nombre,
      documento,
      data.id,
    ];

    await cli.query(query, params);

    return { std: 200 };
  } catch (error) {
    console.error("Error en la query: Documento_Fase > Update >", error);
    return { std: 500 };
  }
};

// DELETE
export const DeleteQuery = async (id: number): Promise<res> => {
  try {
    await cli.query(`DELETE FROM documentos WHERE id = ?`, [id]);
    return { std: 200 };
  } catch (error) {
    console.error("Error en la query: Documento_Fase > Delete >", error);
    return { std: 500 };
  }
};
