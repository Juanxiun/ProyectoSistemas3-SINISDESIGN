import cli from "../../../../../database/connect.ts";
import { conver64, typeFile } from "../../../../../libs/conver64.ts";
import { fileBlob } from "../../../../../libs/converFile.ts"; // Solo se usa la función, no se modifica
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


const uint8ArrayToBase64 = (bytes: Uint8Array): string => {

  const binary = Array.from(bytes, (byte) => String.fromCharCode(byte)).join("");

  return btoa(binary);
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
    // 1. Obtener datos binarios como Uint8Array (usando la función existente)
    const documentBlob = typeof data.documento === "string"
      ? null
      : await fileBlob(data.documento);

    // 2. Convertir a Base64 string para evitar la expansión del driver
    const documentBase64 = documentBlob ? uint8ArrayToBase64(documentBlob) : null;

    // CORRECCIÓN: Usar FROM_BASE64(?) para insertar la cadena Base64 como BLOB en MySQL
    const query = `INSERT INTO documentos (fase, nombre, tipo, documento, fecha)
      VALUES (?, ?, ?, FROM_BASE64(?), ?);`;

    // 3. Pasar la cadena Base64 como un único parámetro
    const params = [
      data.fase,
      data.nombre,
      data.tipo,
      documentBase64,
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
    const isNewFile = data.documento && typeof data.documento !== "string";
    let documentClause = '';
    let documentParam: (Uint8Array | undefined)[] = [];

    if (isNewFile) {
      documentClause = ', documento = ?';
      documentParam = [await fileBlob(data.documento as File)];
    }

    const queryParts = [
      "fase = ?",
      "nombre = ?",
      "tipo = ?",
      "fecha = ?"
    ];

    let params: (string | number | Uint8Array | null | undefined)[] = [
      data.fase,
      data.nombre,
      data.tipo,
      data.fecha
    ];

    if (isNewFile) {
      queryParts.push("documento = ?");
      params.push(documentParam[0]);
    }

    if (data.id) {
      params.push(data.id);
    } else {
      console.error("UpdateQuery: ID de documento es nulo o indefinido.");
      return { std: 400 };
    }

    const query = `UPDATE documentos SET ${queryParts.join(', ')} WHERE id = ?;`;

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