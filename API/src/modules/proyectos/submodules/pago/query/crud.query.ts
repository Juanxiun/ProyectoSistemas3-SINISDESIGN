import cli from "../../../../../database/connect.ts";
import PagoModel from "../model.ts";

interface res {
  data?: PagoModel[];
  std: number;
}

// SELECT
export const SelectQuery = async (proy: number, id?: number): Promise<res> => {
  try {
    const query = `SELECT id, proy, titulo, monto, fecha
      FROM pagos
      WHERE proy = ?${id ? " AND id = ?" : ""}
    `;
    const params = id ? [proy, id] : [proy];

    const [rows] = await cli.query(query, params);
    const pagos = Array.isArray(rows) ? (rows as PagoModel[]) : [];

    return { data: pagos, std: 200 };
  } catch (error) {
    console.error("Error en la query: Pago_Proy > Select >", error);
    return { data: [], std: 500 };
  }
};

// CREATE
export const CreateQuery = async (data: PagoModel): Promise<res> => {
  try {
    const query = `INSERT INTO pagos (proy, titulo, monto, fecha)
      VALUES (?, ?, ?, ?)
    `;
    const params = [
      data.proy,
      data.titulo,
      data.monto,
      data.fecha,
    ];

    await cli.query(query, params);

    return { std: 200 };
  } catch (error) {
    console.error("Error en la query: Pago_Proy > Create >", error);
    return { std: 500 };
  }
};

// UPDATE
export const UpdateQuery = async (data: PagoModel): Promise<res> => {
  try {
    const query = `UPDATE pagos
      SET proy = ?, titulo = ?, monto = ?, fecha = ?
      WHERE id = ?
    `;
    const params = [
      data.proy,
      data.titulo,
      data.monto,
      data.fecha,
      data.id,
    ];

    await cli.query(query, params);

    return { std: 200 };
  } catch (error) {
    console.error("Error en la query: Pago_Proy > Update >", error);
    return { std: 500 };
  }
};

// DELETE
export const DeleteQuery = async (id: number): Promise<res> => {
  try {
    await cli.query(`DELETE FROM pagos WHERE id = ?`, [id]);
    return { std: 200 };
  } catch (error) {
    console.error("Error en la query: Pago_Proy > Delete >", error);
    return { std: 500 };
  }
};