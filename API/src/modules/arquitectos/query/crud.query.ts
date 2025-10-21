import cli from "../../../database/connect.ts";
import ArquitectoModel from "../model.ts";
import pool from '../../../database/connect.ts';

interface res {
  data?: ArquitectoModel[];
  std: number;
}


export const SelectQuery = async (codigo?: string): Promise<res> => {
  try {
    const query = `
      SELECT codigo, ci, nombre, apellido, telefono, correo, admin, estado
      FROM arquitectos
      WHERE estado = 1
      ${codigo ? "AND codigo = ?" : ""}
    `;


    const params = codigo ? [codigo] : [];


    const [rows] = await cli.query(query, params);
    const arquitectos = Array.isArray(rows) ? (rows as ArquitectoModel[]) : [];

    return {
      data: arquitectos,
      std: 200,
    };
  } catch (error) {
    console.error("Error en la query: Arquitectos > Select >", error);
    return {
      data: [],
      std: 500,
    };
  }
};


export const CreateQuery = async (data: ArquitectoModel): Promise<res> => {
  try {
    const query = `
      INSERT INTO arquitectos (codigo, ci, nombre, apellido, telefono, correo, admin, password, estado)
      VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)
    `;
    const params = [
      data.codigo,
      data.ci,
      data.nombre,
      data.apellido,
      data.telefono,
      data.correo,
      data.admin,
      data.password,
      1,
    ];

    await cli.query(query, params);

    return {
      std: 200,
    };
  } catch (error) {
    console.log("Error en la query: Arquitectos > Create >\n" + error);
    return {
      std: 500,
    };
  }
};


export async function UpdateQuery(codigo: string, data: Record<string, string | number>) {
  if (!codigo) throw new Error('Código requerido');
  const keys = Object.keys(data);
  if (keys.length === 0) return null;

  const setClause = keys.map(k => `\`${k}\` = ?`).join(', ');
  const values = keys.map(k => data[k]);
  const sql = `UPDATE arquitectos SET ${setClause} WHERE codigo = ?`;

  values.push(codigo);

  const [result] = await pool.query(sql, values);
  return result;
}

export const DeleteQuery = async (codigo: string): Promise<res> => {
  try {
    await cli.query(
      `UPDATE
            arquitectos
        SET
            estado = 0
        WHERE
            codigo = ?`,
      [codigo]
    );
    return {
      std: 200,
    };
  } catch (error) {
    console.log("Error en la query: Arquitectos > Delete >\n" + error);
    return {
      std: 500,
    };
  }
};