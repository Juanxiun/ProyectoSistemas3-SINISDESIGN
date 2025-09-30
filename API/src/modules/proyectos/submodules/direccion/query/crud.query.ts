import cli from "../../../../../database/connect.ts";
import DireccionModel from "../model.ts";

interface res {
  data?: DireccionModel[];
  std: number;
}

// SELECT
export const SelectQuery = async (proy: number, id?: number): Promise<res> => {
  try {
    const query = `SELECT id, proy, pais, departamento, zona, calle, puerta
      FROM direccion_proyectos
      WHERE proy = ?${id ? " AND id = ?" : ""}
    `;
    const params = id ? [proy, id] : [proy];

    const [rows] = await cli.query(query, params);
    const direcciones = Array.isArray(rows) ? (rows as DireccionModel[]) : [];

    return { data: direcciones, std: 200 };
  } catch (error) {
    console.error("Error en la query: Direccion_Proy > Select >", error);
    return { data: [], std: 500 };
  }
};

// CREATE
export const CreateQuery = async (data: DireccionModel): Promise<res> => {
  try {
    const query = `INSERT INTO direccion_proyectos (proy, pais, departamento, zona, calle, puerta)
      VALUES (?, ?, ?, ?, ?, ?)
    `;
    const params = [
      data.proy,
      data.pais,
      data.departamento,
      data.zona,
      data.calle,
      data.puerta,
    ];

    await cli.query(query, params);

    return { std: 200 };
  } catch (error) {
    console.error("Error en la query: Direccion_Proy > Create >", error);
    return { std: 500 };
  }
};

// UPDATE
export const UpdateQuery = async (data: DireccionModel): Promise<res> => {
  try {
    const query = `UPDATE direccion_proyectos
      SET proy = ?, pais = ?, departamento = ?, zona = ?, calle = ?, puerta = ?
      WHERE id = ?
    `;
    const params = [
      data.proy,
      data.pais,
      data.departamento,
      data.zona,
      data.calle,
      data.puerta,
      data.id,
    ];

    await cli.query(query, params);

    return { std: 200 };
  } catch (error) {
    console.error("Error en la query: Direccion_Proy > Update >", error);
    return { std: 500 };
  }
};

// DELETE
export const DeleteQuery = async (id: number): Promise<res> => {
  try {
    await cli.query(`DELETE FROM direccion_proyectos WHERE id = ?`, [id]);
    return { std: 200 };
  } catch (error) {
    console.error("Error en la query: Direccion_Proy > Delete >", error);
    return { std: 500 };
  }
};