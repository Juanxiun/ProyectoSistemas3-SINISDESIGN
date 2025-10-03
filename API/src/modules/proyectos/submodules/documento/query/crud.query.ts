import cli from "../../../../../database/connect.ts";
import { conver64, typeFile } from "../../../../../libs/conver64.ts";
import { fileBlob } from "../../../../../libs/converFile.ts";
import DocumentoModel from "../model.ts";

interface res {
  data?: DocumentoModel[];
  std: number;
}

const typeFileConvert = (datax: string) => {
  switch (datax) {
    case "pdf":
      return typeFile.pdf;
    case "word":
      return typeFile.word;
    case "excel":
      return typeFile.excel;
    case "zip":
      return typeFile.zip;
    default:
      return typeFile.pdf;
  }
};

// SELECT
export const SelectQuery = async (fase: number, id?: number): Promise<res> => {
  try {
    const query = `SELECT id, fase, nombre, tipo, documento, fecha
      FROM documentos
      WHERE fase = ?${id ? " AND id = ?" : ""};`;
    const params = id ? [fase, id] : [fase];

    const [rows] = await cli.query(query, params);
    const documentos = Array.isArray(rows) ? (rows as DocumentoModel[]) : [];

    const initDoc = documentos.map((p) => {
      let documento64 = "";

      if (p.documento) {
        documento64 = conver64(typeFileConvert(p.tipo), p.documento);
      }

      return { ...p, documento: documento64 };
    });
    return { data: initDoc, std: 200 };
  } catch (error) {
    console.error("Error en la query: Documento_Fase > Select >", error);
    return { data: [], std: 500 };
  }
};

// CREATE
export const CreateQuery = async (data: DocumentoModel): Promise<res> => {
  try {
    const query = `INSERT INTO documentos (fase, nombre, tipo, documento, fecha)
      VALUES (?, ?, ?);`;
    const params = [
      data.fase,
      data.nombre,
      data.tipo,
      typeof data.documento === "string"
        ? null
        : await fileBlob(data.documento),
      data.fecha,
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
    const query = `UPDATE documentos
      SET fase = ?, nombre = ?, tipo, documento = ?, fecha = ?
      WHERE id = ?;`;
    const params = [
      data.fase,
      data.nombre,
      data.tipo,
      typeof data.documento === "string"
        ? null
        : await fileBlob(data.documento),
      data.fecha,
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
    await cli.query(`DELETE FROM documentos WHERE id = ?;`, [id]);
    return { std: 200 };
  } catch (error) {
    console.error("Error en la query: Documento_Fase > Delete >", error);
    return { std: 500 };
  }
};
