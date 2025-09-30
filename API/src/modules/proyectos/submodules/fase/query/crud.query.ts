import cli from "../../../../../database/connect.ts";
import { datetime } from "../../../../../libs/datetimeFormat.ts";
import FaseModel from "../model.ts";

interface res {
  data?: FaseModel[];
  std: number;
}

// SELECT
export const SelectQuery = async (proy: number, id?: number): Promise<res> => {
  try {
    const query = `SELECT id, proy, fase, detalle, inicio, est
      FROM fases
      WHERE proy = ?${id ? " AND id = ?" : ""}
    `;
    const params = id ? [proy, id] : [proy];

    const [rows] = await cli.query(query, params);
    const fases = Array.isArray(rows) ? (rows as FaseModel[]) : [];

    return { data: fases, std: 200 };
  } catch (error) {
    console.error("Error en la query: Fase_Proy > Select >", error);
    return { data: [], std: 500 };
  }
};

// CREATE
export const CreateQuery = async (data: FaseModel): Promise<res> => {
  try {
    const query = `INSERT INTO fases (proy, fase, detalle, inicio, estado)
      VALUES (?, ?, ?, ?)
    `;
    const params = [
      data.proy,
      data.fase,
      data.detalle,
      data.inicio,
      data.estado ?? 1,
    ];

    await cli.query(query, params);

    return { std: 200 };
  } catch (error) {
    console.error("Error en la query: Fase_Proy > Create >", error);
    return { std: 500 };
  }
};

// UPDATE
export const UpdateQuery = async (data: FaseModel): Promise<res> => {
  try {
    const query = `UPDATE fases
      SET proy = ?, fase = ?, detalle = ?, estado = ?
      WHERE id = ?
    `;
    const params = [
      data.proy,
      data.fase,
      data.detalle,
      data.estado ?? 1,
      data.id,
    ];

    await cli.query(query, params);

    return { std: 200 };
  } catch (error) {
    console.error("Error en la query: Fase_Proy > Update >", error);
    return { std: 500 };
  }
};

// DELETE
export const DeleteQuery = async (id: number, final: string): Promise<res> => {
  try {
    await cli.query(
      `UPDATE fases
        SET est = 0, final = ? WHERE id = ?;`,
      [datetime(final), id],
    );
    return { std: 200 };
  } catch (error) {
    console.error("Error en la query: Fase_Proy > Delete >", error);
    return { std: 500 };
  }
};
