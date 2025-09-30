import cli from "../../../../../database/connect.ts";
import TipoModel from "../model.ts";

interface res {
  data?: TipoModel[];
  std: number;
}

// SELECT
export const SelectQuery = async (proy: number, id?: number): Promise<res> => {
  try {
    const query = 
    `SELECT id, proy, tipo, subtipo
      FROM tipo_proyectos
      WHERE proy = ? ${id ? "AND id = ?" : ""}
    `;
    const params = id ? [proy, id] : [proy];

    const [rows] = await cli.query(query, params);
    const tipos = Array.isArray(rows) ? (rows as TipoModel[]) : [];

    return { data: tipos, std: 200 };
  } catch (error) {
    console.error("Error en la query: Tipo_Proy > Select >", error);
    return { data: [], std: 500 };
  }
};

// CREATE
export const CreateQuery = async (data: TipoModel): Promise<res> => {
  try {
    const query = 
    `INSERT INTO tipo_proyectos (proy, tipo, subtipo)
      VALUES (?, ?, ?)
    `;
    const params = [data.proy, data.tipo, data.subtipo];

    await cli.query(query, params);

    return { std: 200 };
  } catch (error) {
    console.error("Error en la query: Tipo_Proy > Create >", error);
    return { std: 500 };
  }
};

// UPDATE
export const UpdateQuery = async (data: TipoModel): Promise<res> => {
  try {
    const query = 
    `UPDATE tipo_proyectos
      SET proy = ?, tipo = ?, subtipo = ?
      WHERE id = ?
    `;
    const params = [data.proy, data.tipo, data.subtipo, data.id];

    await cli.query(query, params);

    return { std: 200 };
  } catch (error) {
    console.error("Error en la query: Tipo_Proy > Update >", error);
    return { std: 500 };
  }
};

// DELETE
export const DeleteQuery = async (id: number): Promise<res> => {
  try {
    await cli.query(`DELETE FROM tipo_proyectos WHERE id = ?`, [id]);
    return { std: 200 };
  } catch (error) {
    console.error("Error en la query: Tipo_Proy > Delete >", error);
    return { std: 500 };
  }
};
