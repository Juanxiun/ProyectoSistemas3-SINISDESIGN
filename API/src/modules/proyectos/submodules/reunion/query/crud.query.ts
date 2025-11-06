import cli from "../../../../../database/connect.ts";
import ReunionModel from "../model.ts";

interface res {
  data?: ReunionModel[];
  std: number;
  insertId?: number;
}

// SELECT
export const SelectQuery = async (proy: number, id?: number): Promise<res> => {
  try {
    const query = `SELECT id, proy, titulo, descripcion, fecha, estado
      FROM reuniones
      WHERE proy = ?${id ? " AND id = ?" : ""}`;
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
    // 5 columnas => 5 placeholders
    const query = `INSERT INTO reuniones (proy, titulo, descripcion, fecha, estado)
      VALUES (?, ?, ?, ?, ?)`;
    const params = [
      data.proy,
      data.titulo,
      data.descripcion,
      data.fecha,
      data.estado ?? 1,
    ];

    const result = await cli.query(query, params);

    // intentar obtener insertId si el driver lo devuelve
    // la forma exacta depende del cliente MySQL que uses en Deno
    let insertId: number | undefined = undefined;
    try {
      // Muchos drivers retornan un objeto con insertId o lastInsertId
      if ((result as any).lastInsertId) insertId = Number((result as any).lastInsertId);
      else if ((result as any).insertId) insertId = Number((result as any).insertId);
      // si tu driver retorna otra forma, ajustar aquí
    } catch (e) {
      // ignore
    }

    return { std: 200, insertId };
  } catch (error) {
    console.error("Error en la query: Reunion_Proy > Create >", error);
    return { std: 500 };
  }
};

// UPDATE
export const UpdateQuery = async (data: ReunionModel): Promise<res> => {
  try {
    const query = `UPDATE reuniones
      SET titulo = ?, descripcion = ?, fecha = ?
      WHERE id = ?;`;
    const params = [
      data.titulo,
      data.descripcion,
      data.fecha,
      data.id,
    ];

    await cli.query(query, params);

    return { std: 200 };
  } catch (error) {
    console.error("Error en la query: Reunion_Proy > Update >", error);
    return { std: 500 };
  }
};

// DELETE (eliminado lógico -> actualizar campo 'estado')
export const DeleteQuery = async (id: number): Promise<res> => {
  try {
    await cli.query(`UPDATE reuniones
      SET estado = 0 
      WHERE id = ?`,
      [id],
    );
    return { std: 200 };
  } catch (error) {
    console.error("Error en la query: Reunion_Proy > Delete >", error);
    return { std: 500 };
  }
};
