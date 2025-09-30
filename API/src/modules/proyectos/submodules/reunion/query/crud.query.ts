import cli from "../../../../../database/connect.ts";
import ReunionModel from "../model.ts";

interface res {
  data?: ReunionModel[];
  std: number;
}

// SELECT
export const SelectQuery = async (proy: number, id?: number): Promise<res> => {
  try {
    const query = `SELECT id, proy, titulo, descripcion, fecha, final, est
      FROM reuniones
      WHERE proy = ?${id ? " AND id = ?" : ""}
    `;
    const params = id ? [proy, id] : [proy];

    const [rows] = await cli.query(query, params);
    const reuniones = Array.isArray(rows) ? (rows as ReunionModel[]) : [];

    return { data: reuniones, std: 200 };
  } catch (error) {
    console.error("Error en la query: Reunion_Proy > Select >", error);
    return { data: [], std: 500 };
  }
};

// CREATE
export const CreateQuery = async (data: ReunionModel): Promise<res> => {
  try {
    const query = `INSERT INTO reuniones (proy, titulo, descripcion, fecha, estado)
      VALUES (?, ?, ?, ?, ?, ?)
    `;
    const params = [
      data.proy,
      data.titulo,
      data.descripcion,
      data.fecha,
      data.estado ?? 1,
    ];

    await cli.query(query, params);

    return { std: 200 };
  } catch (error) {
    console.error("Error en la query: Reunion_Proy > Create >", error);
    return { std: 500 };
  }
};

// UPDATE
export const UpdateQuery = async (data: ReunionModel): Promise<res> => {
  try {
    const query = `UPDATE reuniones
      SET proy = ?, titulo = ?, descripcion = ?, fecha = ?, estado = ?
      WHERE id = ?
    `;
    const params = [
      data.proy,
      data.titulo,
      data.descripcion,
      data.fecha,
      data.estado ?? 1,
      data.id,
    ];

    await cli.query(query, params);

    return { std: 200 };
  } catch (error) {
    console.error("Error en la query: Reunion_Proy > Update >", error);
    return { std: 500 };
  }
};

// DELETE
export const DeleteQuery = async (id: number): Promise<res> => {
  try {
    await cli.query(`UPDATE reuniones
      SET est = 0 
      WHERE id = ?`,
      [id],
    );
    return { std: 200 };
  } catch (error) {
    console.error("Error en la query: Reunion_Proy > Delete >", error);
    return { std: 500 };
  }
};
